// 👥 PMLive — multiplayer for the arenas. WebRTC peer-to-peer: session content
// flows browser-to-browser; ONLY the SDP handshake (offer/answer blobs) touches
// the worker's /signal endpoint, expiring in 5 minutes. No accounts, no rooms DB.
(function (g) {
  'use strict';
  var SIGNAL = 'https://pm-skills-mcp.pm-claude-skills.workers.dev/signal';
  var ICE = { iceServers: [{ urls: 'stun:stun.l.google.com:19302' }] };
  function roomId() { return Math.random().toString(36).slice(2, 8).toUpperCase(); }
  function post(room, role, payload) {
    return fetch(SIGNAL + '?room=' + room + '&role=' + role, { method: 'POST', body: JSON.stringify(payload) });
  }
  async function poll(room, role, tries) {
    for (var i = 0; i < (tries || 60); i++) {
      var r = await fetch(SIGNAL + '?room=' + room + '&role=' + role);
      if (r.ok) return r.json();
      await new Promise(function (res) { setTimeout(res, 2000); });
    }
    throw new Error('nobody joined in time');
  }
  // Wait for ICE gathering so the SDP blob is complete (no trickle over KV).
  function gathered(pc) {
    return new Promise(function (res) {
      if (pc.iceGatheringState === 'complete') return res();
      pc.addEventListener('icegatheringstatechange', function () { if (pc.iceGatheringState === 'complete') res(); });
      setTimeout(res, 4000);   // good-enough fallback
    });
  }
  // Host: create a room, return {room, send(obj), onPeer(cb)} — send() streams events to the watcher.
  async function host() {
    var room = roomId();
    var pc = new RTCPeerConnection(ICE);
    var ch = pc.createDataChannel('arena');
    var peerCb = null, openCb = null;
    ch.onmessage = function (e) { if (peerCb) try { peerCb(JSON.parse(e.data)); } catch (_) {} };
    ch.onopen = function () { if (openCb) openCb(); };
    await pc.setLocalDescription(await pc.createOffer());
    await gathered(pc);
    await post(room, 'offer', pc.localDescription);
    poll(room, 'answer').then(function (ans) { return pc.setRemoteDescription(ans); }).catch(function () {});
    return {
      room: room,
      send: function (obj) { if (ch.readyState === 'open') ch.send(JSON.stringify(obj)); },
      onPeer: function (cb) { peerCb = cb; },
      onOpen: function (cb) { openCb = cb; if (ch.readyState === 'open') cb(); },
    };
  }
  // Watcher: join a room, return {send(obj), onEvent(cb)}.
  async function watch(room) {
    var pc = new RTCPeerConnection(ICE);
    var evCb = null, openCb = null, ch = null;
    pc.ondatachannel = function (e) {
      ch = e.channel;
      ch.onmessage = function (m) { if (evCb) try { evCb(JSON.parse(m.data)); } catch (_) {} };
      ch.onopen = function () { if (openCb) openCb(); };
    };
    var offer = await poll(room, 'offer', 5);
    await pc.setRemoteDescription(offer);
    await pc.setLocalDescription(await pc.createAnswer());
    await gathered(pc);
    await post(room, 'answer', pc.localDescription);
    return {
      send: function (obj) { if (ch && ch.readyState === 'open') ch.send(JSON.stringify(obj)); },
      onEvent: function (cb) { evCb = cb; },
      onOpen: function (cb) { openCb = cb; },
    };
  }
  g.PMLive = { host: host, watch: watch };
})(window);

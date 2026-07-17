// PM Skills Cockpit — a faithful Tauri shell over the bundled web/ app,
// plus the powers a browser can't have:
//  - read_local_folder / read_local_file commands: run skills (decoders!)
//    against real documents on disk — with Ollama selected, the document
//    never leaves the machine.
//  - a tray with quick actions (open, local docs, quit).
// Native surface stays deliberately small; the web app is the product.
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use std::fs;
use std::path::PathBuf;

const MAX_FILE: u64 = 512 * 1024; // skills read text documents, not disk images

fn text_like(name: &str) -> bool {
    let lower = name.to_lowercase();
    [".md", ".txt", ".markdown", ".csv", ".json", ".html", ".rtf", ".log", ".tex"]
        .iter()
        .any(|e| lower.ends_with(e))
}

#[tauri::command]
fn read_local_folder(path: String) -> Result<Vec<serde_json::Value>, String> {
    let dir = PathBuf::from(&path);
    if !dir.is_dir() {
        return Err(format!("not a folder: {path}"));
    }
    let mut out = vec![];
    for entry in fs::read_dir(&dir).map_err(|e| e.to_string())? {
        let entry = entry.map_err(|e| e.to_string())?;
        let meta = entry.metadata().map_err(|e| e.to_string())?;
        let name = entry.file_name().to_string_lossy().to_string();
        if meta.is_file() && text_like(&name) && meta.len() <= MAX_FILE {
            out.push(serde_json::json!({
                "name": name,
                "path": entry.path().to_string_lossy(),
                "size": meta.len(),
            }));
        }
    }
    out.sort_by(|a, b| a["name"].as_str().cmp(&b["name"].as_str()));
    Ok(out)
}

#[tauri::command]
fn read_local_file(path: String) -> Result<String, String> {
    let p = PathBuf::from(&path);
    let meta = fs::metadata(&p).map_err(|e| e.to_string())?;
    if !meta.is_file() || meta.len() > MAX_FILE {
        return Err("not a readable document (text files up to 512KB)".into());
    }
    if !text_like(&p.file_name().unwrap_or_default().to_string_lossy()) {
        return Err("unsupported file type".into());
    }
    fs::read_to_string(&p).map_err(|e| e.to_string())
}

fn main() {
    use tauri::{
        menu::{Menu, MenuItem},
        tray::TrayIconBuilder,
        Manager,
    };
    tauri::Builder::default()
        .plugin(tauri_plugin_updater::Builder::new().build())
        .invoke_handler(tauri::generate_handler![read_local_folder, read_local_file])
        .setup(|app| {
            // Auto-update: check on launch, install silently, apply on next
            // restart. Failures are logged, never surfaced as blockers.
            let handle = app.handle().clone();
            tauri::async_runtime::spawn(async move {
                use tauri_plugin_updater::UpdaterExt;
                if let Ok(updater) = handle.updater() {
                    match updater.check().await {
                        Ok(Some(update)) => {
                            let _ = update.download_and_install(|_, _| {}, || {}).await;
                        }
                        Ok(None) => {}
                        Err(e) => eprintln!("updater check failed (non-fatal): {e}"),
                    }
                }
            });
            let open = MenuItem::with_id(app, "open", "Open PM Skills", true, None::<&str>)?;
            let local = MenuItem::with_id(app, "local", "Local documents…", true, None::<&str>)?;
            let quit = MenuItem::with_id(app, "quit", "Quit", true, None::<&str>)?;
            let menu = Menu::with_items(app, &[&open, &local, &quit])?;
            TrayIconBuilder::new()
                .icon(app.default_window_icon().unwrap().clone())
                .menu(&menu)
                .on_menu_event(|app, event| {
                    let show = |url: &str| {
                        if let Some(w) = app.get_webview_window("main") {
                            let _ = w.eval(&format!("location.href='{url}'"));
                            let _ = w.show();
                            let _ = w.set_focus();
                        }
                    };
                    match event.id.as_ref() {
                        "open" => show("index.html"),
                        "local" => show("localdocs.html"),
                        "quit" => app.exit(0),
                        _ => {}
                    }
                })
                .build(app)?;
            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running pm-skills cockpit");
}

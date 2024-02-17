// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]
use tauri::{CustomMenuItem, Menu, MenuItem, Submenu, WindowMenuEvent, Wry};

// Learn more about Tauri commands at https://tauri.app/v1/guides/features/command
#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from Rust!", name)
}

//メニューの作成
fn create_menu() -> Menu {
    let new = CustomMenuItem::new("new".to_string(), "New Project");
    let open = CustomMenuItem::new("open".to_string(), "Open Project");
    let filemenu = Submenu::new(
        "File",
        Menu::new()
            .add_submenu(Submenu::new(
                "Project",
                Menu::new().add_item(new).add_item(open),
            ))
            .add_native_item(MenuItem::Separator)
            .add_item(CustomMenuItem::new("File Open".to_string(), "File Open..."))
            .add_item(CustomMenuItem::new("File Save", "File Save"))
            .add_item(CustomMenuItem::new("File Save As", "File Save As..."))
            .add_native_item(MenuItem::Separator)
            .add_native_item(MenuItem::Quit),
    );
    let editmenu = Submenu::new(
        "Edit",
        Menu::new()
            .add_item(CustomMenuItem::new("Undo".to_string(), "Undo"))
            .add_item(CustomMenuItem::new("Redo".to_string(), "Redo"))
            .add_native_item(MenuItem::Separator)
            .add_item(CustomMenuItem::new("Cut".to_string(), "Cut"))
            .add_item(CustomMenuItem::new("Copy".to_string(), "Copy"))
            .add_item(CustomMenuItem::new("Paste".to_string(), "Paste"))
            .add_item(CustomMenuItem::new("Delete".to_string(), "Delete"))
    );

    let menu = Menu::new().add_submenu(filemenu).add_submenu(editmenu);

    menu
}
// イベントハンドラ
fn on_main_menu_event(event: WindowMenuEvent<Wry>) {
    match event.menu_item_id() {
        "hide" => event.window().hide().unwrap(),
        "quit" | "close" => event.window().close().unwrap(),
        _ => {}
    }
}
fn main() {
    //起動
    tauri::Builder::default()
        .menu(create_menu())
        .on_menu_event(on_main_menu_event)
        .invoke_handler(tauri::generate_handler![greet])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
    //
}

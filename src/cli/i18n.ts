const LANG = process.env.BWVI_LANG || "zh-CN";

const MESSAGES: Record<string, Record<string, string>> = {
  "zh-CN": {
    task_required: "请提供任务描述",
    file_required: "请提供 HTML 文件路径",
    not_found: "未找到",
    generating: "正在生成",
    generated: "已生成",
    analyzing: "正在分析",
    analysis_done: "分析完成",
    style_applied: "风格已应用",
    brand_loaded: "品牌已加载",
    device_framed: "设备边框已应用",
    server_started: "BWVI 预览服务器已启动",
    listening_on: "监听地址",
    demo_dir: "demo 目录",
    stop_hint: "按 Ctrl+C 停止",
    unknown_command: "未知命令",
    available_commands: "可用命令",
    missing_api_key: "未配置 API Key",
    export_done: "导出完成",
    animation_embedded: "动画已嵌入",
    preview_ready: "预览已生成",
    blueprint_matched: "蓝图匹配",
    direction: "方向",
    brand: "品牌",
    style: "风格",
    device: "设备",
    error_occurred: "发生错误",
    success: "成功",
  },
  "en": {
    task_required: "Please provide a task description",
    file_required: "Please provide an HTML file path",
    not_found: "Not found",
    generating: "Generating",
    generated: "Generated",
    analyzing: "Analyzing",
    analysis_done: "Analysis complete",
    style_applied: "Style applied",
    brand_loaded: "Brand loaded",
    device_framed: "Device frame applied",
    server_started: "BWVI preview server started",
    listening_on: "Listening on",
    demo_dir: "Demo directory",
    stop_hint: "Press Ctrl+C to stop",
    unknown_command: "Unknown command",
    available_commands: "Available commands",
    missing_api_key: "API Key not configured",
    export_done: "Export complete",
    animation_embedded: "Animation embedded",
    preview_ready: "Preview generated",
    blueprint_matched: "Blueprint matched",
    direction: "Direction",
    brand: "Brand",
    style: "Style",
    device: "Device",
    error_occurred: "An error occurred",
    success: "Success",
  },
};

export function t(key: string, fallback?: string): string {
  return MESSAGES[LANG]?.[key] || MESSAGES["en"]?.[key] || fallback || key;
}

export function setLang(lang: string): void {
  (process as any).env.BWVI_LANG = lang;
}

/**
 * i18n.ts — BWVI 国际化支持
 *
 * 用法:
 *   import { t } from "./i18n.js";
 *   console.log(t("generating", "Generating..."));
 *
 * 设置语言:
 *   BWVI_LANG=en bwvi generate ...
 *   process.env.BWVI_LANG = "en";
 */

const LANG = process.env.BWVI_LANG || "zh-CN";

const MESSAGES: Record<string, Record<string, string>> = {
  "zh-CN": {
    // 通用
    task_required: "请提供任务描述",
    file_required: "请提供 HTML 文件路径",
    not_found: "未找到",
    unknown_command: "未知命令",
    available_commands: "可用命令",
    error_occurred: "发生错误",
    success: "成功",
    failed: "失败",
    processing: "处理中",
    done: "完成",
    generating: "正在生成",
    generated: "已生成",
    analyzing: "正在分析",
    analysis_done: "分析完成",

    // 项目
    init_project: "请先运行 bwvi init <项目名> 创建项目",
    project_created: "项目已创建",
    no_project: "未找到 .bwvi 项目",

    // 风格与品牌
    style_applied: "风格已应用",
    style_list: "视觉风格列表",
    style_count: "{n} 种内置风格",
    brand_loaded: "品牌已加载",
    brand_list: "品牌列表",
    brand_count: "{n} 个内置品牌",
    brand_search: "品牌搜索结果",
    brand_not_found: "未找到品牌",

    // 设备
    device_framed: "设备边框已应用",
    device_list: "支持的设备边框",

    // 蓝图
    blueprint_matched: "蓝图匹配",
    blueprint_confidence: "匹配置信度: {n}%",

    // 方向
    direction: "方向",
    direction_recommended: "推荐方向",
    direction_count: "{n} 种设计方向",

    // 生成
    generate_start: "正在生成设计...",
    generate_done: "设计已生成",
    generate_file: "已生成: {file}",
    generate_engine: "渲染引擎: {engine}",

    // 评审
    critique_start: "正在评审...",
    critique_done: "评审完成",
    critique_score: "评分: {score}/10",
    critique_passed: "评审通过",
    critique_failed: "评审未通过",
    critique_issues: "发现 {n} 个问题",

    // 动画/视频
    animation_embedded: "动画已嵌入",
    recording_start: "开始录制...",
    recording_done: "录制完成",
    recording_duration: "时长: {n}s",
    recording_error: "录制失败",
    composing: "正在合成视频...",
    compose_done: "视频合成完成",
    bgm_generating: "正在生成背景音乐",
    bgm_ready: "BGM 已就绪",
    bgm_not_available: "BGM 不可用",
    ffmpeg_required: "需要安装 ffmpeg",
    ffmpeg_guide: "安装命令: {cmd}",

    // 预览 / 服务
    server_started: "BWVI 预览服务器已启动",
    listening_on: "监听地址",
    demo_dir: "demo 目录",
    stop_hint: "按 Ctrl+C 停止",
    preview_ready: "预览已生成",

    // 学习
    learning: "正在学习...",
    learn_done: "学习完成",
    learn_from_url: "从 URL 学习设计",
    learn_extracted: "提取了 {n} 个色值, {m} 个字体",

    // 导出
    export_done: "导出完成",
    export_format: "导出格式: {format}",
    export_error: "导出失败",

    // MCP
    mcp_started: "MCP Server 已启动",
    mcp_sse_started: "MCP SSE Server 已启动 (端口 {port})",

    // 插件
    plugin_created: "插件脚手架已创建",
    plugin_name: "插件名称: {name}",

    // 基准测试
    benchmark_start: "正在运行基准测试...",
    benchmark_done: "基准测试完成: {n}/{total} 通过",

    // 设计债
    debt_added: "设计债已添加",
    debt_list: "设计债列表",
    debt_resolved: "设计债已解决",

    // 历史
    history_title: "质量历史",
    history_empty: "暂无数据",

    // 反馈
    feedback_recorded: "反馈已记录",
    feedback_score: "评分: {score}/10",

    // 模板
    template_list: "模板列表",
    template_count: "{n} 个内置模板",

    // 帮助
    help_title: "BWVI — Better Way of Visual Intelligence\n\nCommands:",
    help_footer: "bwvi <command> --help 查看详情",

    // 资产
    asset_search: "正在搜索品牌资产...",
    asset_found: "找到品牌: {name}",
    asset_not_found: "未在本地和网络找到品牌信息",

    // Diff
    diff_title: "设计版本对比",
    diff_improved: "评分提升: +{n}",
    diff_regressed: "评分下降: {n}",
  },

  "en": {
    // General
    task_required: "Please provide a task description",
    file_required: "Please provide an HTML file path",
    not_found: "Not found",
    unknown_command: "Unknown command",
    available_commands: "Available commands",
    error_occurred: "An error occurred",
    success: "Success",
    failed: "Failed",
    processing: "Processing",
    done: "Done",
    generating: "Generating",
    generated: "Generated",
    analyzing: "Analyzing",
    analysis_done: "Analysis complete",

    // Project
    init_project: "Please run bwvi init <project> first",
    project_created: "Project created",
    no_project: "No .bwvi project found",

    // Style & Brand
    style_applied: "Style applied",
    style_list: "Visual styles",
    style_count: "{n} built-in styles",
    brand_loaded: "Brand loaded",
    brand_list: "Brands",
    brand_count: "{n} built-in brands",
    brand_search: "Brand search results",
    brand_not_found: "Brand not found",

    // Device
    device_framed: "Device frame applied",
    device_list: "Supported device frames",

    // Blueprint
    blueprint_matched: "Blueprint matched",
    blueprint_confidence: "Match confidence: {n}%",

    // Direction
    direction: "Direction",
    direction_recommended: "Recommended directions",
    direction_count: "{n} design directions",

    // Generate
    generate_start: "Generating design...",
    generate_done: "Design generated",
    generate_file: "Generated: {file}",
    generate_engine: "Render engine: {engine}",

    // Critique
    critique_start: "Analyzing...",
    critique_done: "Analysis complete",
    critique_score: "Score: {score}/10",
    critique_passed: "Passed review",
    critique_failed: "Failed review",
    critique_issues: "{n} issues found",

    // Animation/Video
    animation_embedded: "Animation embedded",
    recording_start: "Starting recording...",
    recording_done: "Recording complete",
    recording_duration: "Duration: {n}s",
    recording_error: "Recording failed",
    composing: "Composing video...",
    compose_done: "Video composition complete",
    bgm_generating: "Generating background music",
    bgm_ready: "BGM ready",
    bgm_not_available: "BGM not available",
    ffmpeg_required: "ffmpeg is required",
    ffmpeg_guide: "Install: {cmd}",

    // Preview / Server
    server_started: "BWVI preview server started",
    listening_on: "Listening on",
    demo_dir: "Demo directory",
    stop_hint: "Press Ctrl+C to stop",
    preview_ready: "Preview generated",

    // Learn
    learning: "Learning...",
    learn_done: "Learning complete",
    learn_from_url: "Learning design from URL",
    learn_extracted: "Extracted {n} colors, {m} fonts",

    // Export
    export_done: "Export complete",
    export_format: "Format: {format}",
    export_error: "Export failed",

    // MCP
    mcp_started: "MCP Server started",
    mcp_sse_started: "MCP SSE Server started (port {port})",

    // Plugin
    plugin_created: "Plugin scaffold created",
    plugin_name: "Plugin: {name}",

    // Benchmark
    benchmark_start: "Running benchmarks...",
    benchmark_done: "Benchmark complete: {n}/{total} passed",

    // Design debt
    debt_added: "Design debt added",
    debt_list: "Design debt list",
    debt_resolved: "Design debt resolved",

    // History
    history_title: "Quality history",
    history_empty: "No data yet",

    // Feedback
    feedback_recorded: "Feedback recorded",
    feedback_score: "Score: {score}/10",

    // Template
    template_list: "Templates",
    template_count: "{n} built-in templates",

    // Help
    help_title: "BWVI — Better Way of Visual Intelligence\n\nCommands:",
    help_footer: "bwvi <command> --help for details",

    // Asset
    asset_search: "Searching brand assets...",
    asset_found: "Found brand: {name}",
    asset_not_found: "Brand not found locally or on the web",

    // Diff
    diff_title: "Design version diff",
    diff_improved: "Score improved: +{n}",
    diff_regressed: "Score regressed: {n}",
  },
};

export function t(key: string, fallback?: string): string {
  return MESSAGES[LANG]?.[key] || MESSAGES["en"]?.[key] || fallback || key;
}

export function tpl(key: string, vars: Record<string, string | number>, fallback?: string): string {
  let msg = MESSAGES[LANG]?.[key] || MESSAGES["en"]?.[key] || fallback || key;
  for (const [k, v] of Object.entries(vars)) {
    msg = msg.replace(`{${k}}`, String(v));
  }
  return msg;
}

export function setLang(lang: string): void {
  (process as any).env.BWVI_LANG = lang;
}

export function getLang(): string {
  return process.env.BWVI_LANG || "zh-CN";
}

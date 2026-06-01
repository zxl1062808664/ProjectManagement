const LEGACY_STORAGE_KEY = "task-atlas-data-v1";
const GUEST_WORKSPACE_KEY = "task-atlas-workspace-v2";
const THEME_STORAGE_KEY = "task-atlas-theme-v1";
const SCHEDULE_ALL_PROJECTS_VALUE = "__all_projects__";

const STATUS_ORDER = ["todo", "doing", "review", "done"];
const STATUS_META = {
  todo: { label: "未开始" },
  doing: { label: "进行中" },
  review: { label: "待验收" },
  done: { label: "已完成" },
};

const PRIORITY_META = {
  low: { label: "低", rank: 1 },
  medium: { label: "中", rank: 2 },
  high: { label: "高", rank: 3 },
  urgent: { label: "紧急", rank: 4 },
};

const APP_PLATFORM_META = {
  ios: { label: "iOS" },
  android: { label: "Android" },
  web: { label: "Web" },
  miniapp: { label: "小程序" },
  desktop: { label: "桌面端" },
  service: { label: "服务端" },
};

const VERSION_STATUS_META = {
  todo: { label: "待规划" },
  doing: { label: "开发中" },
  review: { label: "待发布" },
  done: { label: "已发布" },
};

const VERSION_CHANNEL_META = {
  stable: { label: "正式发布" },
  gray: { label: "灰度发布" },
  beta: { label: "Beta" },
  internal: { label: "内部包" },
  hotfix: { label: "Hotfix" },
};

const KIOSK_PRINTER_CONNECTION_META = {
  usb: { label: "USB" },
  bluetooth: { label: "蓝牙" },
  wifi: { label: "WiFi" },
};

const KIOSK_PLATFORM_OPTIONS = ["Windows", "Android", "iOS"];
const KIOSK_REMOTE_PLATFORM_OPTIONS = [
  "Anydesk",
  "Todesk",
  "Rustdesk",
  "向日葵",
  "TeamViewer",
];

const DEFAULT_PROJECT_NAME = "本地收件箱";
const DEFAULT_PROJECT_DESCRIPTION = "未登录时保存在浏览器中的默认项目。";
const LEGACY_APP_MIGRATION_PROJECT_NAME = "版本迁移项目";
const LEGACY_APP_MIGRATION_PROJECT_DESCRIPTION = "自动承接旧版独立 App 数据的迁移项目。";
const THEME_META = {
  day: {
    label: "白天模式",
    description: "当前使用白天模式，适合明亮环境下浏览任务和账号信息。",
  },
  night: {
    label: "晚上模式",
    description: "当前使用晚上模式，适合夜间或低亮度环境下查看任务内容。",
  },
};

const TOOL_META = {
  projects: {
    label: "项目管理",
    description: "统一创建、修改项目，并维护当前项目标签。",
    group: "project-management",
  },
  overview: {
    label: "任务总览",
    description: "默认先看全局统计、状态分布和项目摘要，再进入详情处理具体任务。",
    group: "project-management",
  },
  details: {
    label: "任务管理",
    description: "按已有项目查看任务列表，并为当前项目维护任务。",
    group: "project-management",
  },
  schedule: {
    label: "日程表",
    description: "按日历查看当前项目的任务和版本安排及当天详情。",
    group: "project-management",
  },
  "kiosk-details": {
    label: "Kiosk 统计",
    description: "按已有项目查看 Kiosk 列表，并维护设备、打印机和远控信息。",
    group: "project-management",
  },
  "app-overview": {
    label: "版本总览",
    description: "查看当前项目下的应用数量、版本状态分布和最近版本摘要。",
    group: "project-management",
  },
  "app-details": {
    label: "App 版本管理",
    description: "按当前项目查看 App 列表，并维护该项目下的版本记录。",
    group: "project-management",
  },
  data: {
    label: "数据工具",
    description: "导入、导出、示例数据和浏览器本地数据清理。",
    group: "data-tools",
  },
  utilities: {
    label: "常用工具",
    description: "集中处理快捷操作、摘要复制和工作区快照导出。",
    group: "common-tools",
  },
  account: {
    label: "账号与同步",
    description: "登录、会话刷新和游客数据导入云端。",
    group: "account-sync",
  },
};

const state = {
  auth: {
    mode: "login",
    user: null,
    session: null,
    loading: true,
    submitting: false,
  },
  guestWorkspace: loadGuestWorkspace(),
  workspace: createEmptyWorkspaceView("guest"),
  appWorkspace: createEmptyAppWorkspaceView("guest"),
  scheduleAllProjects: createEmptyScheduleAllProjectsView(),
  ui: {
    themeMode: loadThemeMode(),
    activeTool: "overview",
    collapsedGroups: {
      "project-management": false,
      "data-tools": false,
      "common-tools": false,
      "account-sync": false,
    },
    projectFormMode: "edit",
    editingProjectId: null,
    editingTagId: null,
    editingKioskId: null,
    editingTaskId: null,
    activeDetailPanel: null,
    activeKioskDetailPanel: null,
    kioskRegionFilter: "all",
    expandedOverviewProjectIds: [],
    expandedTaskRecordIds: [],
    selectedTaskIds: [],
    detailSearch: "",
    detailStatusFilter: "all",
    detailTagFilter: "all",
    scheduleProjectFilter: "",
    taskCalendarMonth: getCalendarMonthKey(todayString()),
    taskCalendarSelectedDate: todayString(),
    appFormMode: "edit",
    editingAppId: null,
    editingVersionId: null,
    activeAppDetailPanel: null,
    projectEditDialogOpen: false,
    projectCreateDialogOpen: false,
    expandedAppOverviewIds: [],
    expandedVersionRecordIds: [],
    selectedVersionIds: [],
    versionDetailSearch: "",
    versionDetailStatusFilter: "all",
    versionDetailChannelFilter: "all",
  },
  toastTimer: null,
};

const elements = {
  toolboxNav: document.querySelector("#toolboxNav"),
  toolboxGroups: document.querySelectorAll("[data-group]"),
  toolboxButtons: document.querySelectorAll("[data-tool]"),
  toolboxActionButtons: document.querySelectorAll("[data-tool-action]"),
  workspaceViews: document.querySelectorAll("[data-view]"),
  authStatePill: document.querySelector("#authStatePill"),
  workspaceModePill: document.querySelector("#workspaceModePill"),
  toolboxProjectName: document.querySelector("#toolboxProjectName"),
  toolboxProjectMeta: document.querySelector("#toolboxProjectMeta"),
  todayLabel: document.querySelector("#todayLabel"),
  overviewProjectCount: document.querySelector("#overviewProjectCount"),
  overviewActiveProjectCount: document.querySelector("#overviewActiveProjectCount"),
  overviewTaskCount: document.querySelector("#overviewTaskCount"),
  overviewCompletionRate: document.querySelector("#overviewCompletionRate"),
  overviewTodoCount: document.querySelector("#overviewTodoCount"),
  overviewDoingCount: document.querySelector("#overviewDoingCount"),
  overviewReviewCount: document.querySelector("#overviewReviewCount"),
  overviewDoneCount: document.querySelector("#overviewDoneCount"),
  projectOverviewList: document.querySelector("#projectOverviewList"),
  appOverviewAppCount: document.querySelector("#appOverviewAppCount"),
  appOverviewActiveAppCount: document.querySelector("#appOverviewActiveAppCount"),
  appOverviewVersionCount: document.querySelector("#appOverviewVersionCount"),
  appOverviewReleaseRate: document.querySelector("#appOverviewReleaseRate"),
  appOverviewTodoCount: document.querySelector("#appOverviewTodoCount"),
  appOverviewDoingCount: document.querySelector("#appOverviewDoingCount"),
  appOverviewReviewCount: document.querySelector("#appOverviewReviewCount"),
  appOverviewDoneCount: document.querySelector("#appOverviewDoneCount"),
  appVersionOverviewList: document.querySelector("#appVersionOverviewList"),
  projectManagerList: document.querySelector("#projectManagerList"),
  detailProjectCountBadge: document.querySelector("#detailProjectCountBadge"),
  kioskProjectSelect: document.querySelector("#kioskProjectSelect"),
  kioskProjectPanelButton: document.querySelector("#kioskProjectPanelButton"),
  projectKioskCountBadge: document.querySelector("#projectKioskCountBadge"),
  projectKioskNewButton: document.querySelector("#projectKioskNewButton"),
  kioskDetailPanelBackdrop: document.querySelector("#kioskDetailPanelBackdrop"),
  kioskDetailPanel: document.querySelector("#kioskDetailPanel"),
  kioskDetailPanelCloseButtons: document.querySelectorAll("[data-kiosk-detail-panel-close]"),
  kioskEditorModeBadge: document.querySelector("#kioskEditorModeBadge"),
  kioskProjectHint: document.querySelector("#kioskProjectHint"),
  projectKioskMeta: document.querySelector("#projectKioskMeta"),
  kioskRegionFilterInput: document.querySelector("#kioskRegionFilterInput"),
  projectKioskStats: document.querySelector("#projectKioskStats"),
  kioskForm: document.querySelector("#kioskForm"),
  kioskIdInput: document.querySelector("#kioskIdInput"),
  kioskRegionInput: document.querySelector("#kioskRegionInput"),
  kioskLocationInput: document.querySelector("#kioskLocationInput"),
  kioskPrinterConnectionInput: document.querySelector("#kioskPrinterConnectionInput"),
  kioskPrinterModelInput: document.querySelector("#kioskPrinterModelInput"),
  kioskPrinterNotesInput: document.querySelector("#kioskPrinterNotesInput"),
  kioskPlatformSelect: document.querySelector("#kioskPlatformSelect"),
  kioskPlatformInput: document.querySelector("#kioskPlatformInput"),
  kioskRemotePlatformSelect: document.querySelector("#kioskRemotePlatformSelect"),
  kioskRemotePlatformInput: document.querySelector("#kioskRemotePlatformInput"),
  kioskRemoteCodeInput: document.querySelector("#kioskRemoteCodeInput"),
  kioskActiveAppSelect: document.querySelector("#kioskActiveAppSelect"),
  kioskActiveVersionSelect: document.querySelector("#kioskActiveVersionSelect"),
  kioskNotesInput: document.querySelector("#kioskNotesInput"),
  kioskSubmitButton: document.querySelector("#kioskSubmitButton"),
  kioskResetButton: document.querySelector("#kioskResetButton"),
  projectKioskList: document.querySelector("#projectKioskList"),
  detailProjectPanelButton: document.querySelector("#detailProjectPanelButton"),
  detailTaskPanelButton: document.querySelector("#detailTaskPanelButton"),
  detailPanelBackdrop: document.querySelector("#detailPanelBackdrop"),
  detailTaskPanel: document.querySelector("#detailTaskPanel"),
  detailPanelCloseButtons: document.querySelectorAll("[data-detail-panel-close]"),
  projectFormCopy: document.querySelector("#projectFormCopy"),
  detailProjectSelect: document.querySelector("#detailProjectSelect"),
  projectForm: document.querySelector("#projectForm"),
  projectIdInput: document.querySelector("#projectIdInput"),
  projectNameInput: document.querySelector("#projectNameInput"),
  projectColorInput: document.querySelector("#projectColorInput"),
  projectDescriptionInput: document.querySelector("#projectDescriptionInput"),
  projectSubmitButton: document.querySelector("#projectSubmitButton"),
  projectNewButton: document.querySelector("#projectNewButton"),
  projectArchiveButton: document.querySelector("#projectArchiveButton"),
  projectDeleteButton: document.querySelector("#projectDeleteButton"),
  tagManagerCopy: document.querySelector("#tagManagerCopy"),
  tagForm: document.querySelector("#tagForm"),
  tagIdInput: document.querySelector("#tagIdInput"),
  tagNameInput: document.querySelector("#tagNameInput"),
  tagColorInput: document.querySelector("#tagColorInput"),
  tagSubmitButton: document.querySelector("#tagSubmitButton"),
  tagResetButton: document.querySelector("#tagResetButton"),
  detailTagList: document.querySelector("#detailTagList"),
  taskEditorModeBadge: document.querySelector("#taskEditorModeBadge"),
  taskProjectHint: document.querySelector("#taskProjectHint"),
  taskForm: document.querySelector("#taskForm"),
  taskIdInput: document.querySelector("#taskIdInput"),
  titleInput: document.querySelector("#titleInput"),
  descriptionInput: document.querySelector("#descriptionInput"),
  notesInput: document.querySelector("#notesInput"),
  statusInput: document.querySelector("#statusInput"),
  priorityInput: document.querySelector("#priorityInput"),
  assigneeInput: document.querySelector("#assigneeInput"),
  startDateInput: document.querySelector("#startDateInput"),
  dueDateInput: document.querySelector("#dueDateInput"),
  completedDateInput: document.querySelector("#completedDateInput"),
  taskTagPicker: document.querySelector("#taskTagPicker"),
  subtasksInput: document.querySelector("#subtasksInput"),
  taskSubmitButton: document.querySelector("#taskSubmitButton"),
  taskResetButton: document.querySelector("#taskResetButton"),
  taskListSummary: document.querySelector("#taskListSummary"),
  detailCurrentProjectMeta: document.querySelector("#detailCurrentProjectMeta"),
  taskSearchInput: document.querySelector("#taskSearchInput"),
  taskStatusFilterInput: document.querySelector("#taskStatusFilterInput"),
  taskTagFilterInput: document.querySelector("#taskTagFilterInput"),
  scheduleProjectSelect: document.querySelector("#scheduleProjectSelect"),
  scheduleProjectPanelButton: document.querySelector("#scheduleProjectPanelButton"),
  taskCalendarMonthLabel: document.querySelector("#taskCalendarMonthLabel"),
  taskCalendarPrevButton: document.querySelector("#taskCalendarPrevButton"),
  taskCalendarTodayButton: document.querySelector("#taskCalendarTodayButton"),
  taskCalendarNextButton: document.querySelector("#taskCalendarNextButton"),
  taskCalendarGrid: document.querySelector("#taskCalendarGrid"),
  taskCalendarDetailTitle: document.querySelector("#taskCalendarDetailTitle"),
  taskCalendarDetailBadge: document.querySelector("#taskCalendarDetailBadge"),
  taskCalendarDetailList: document.querySelector("#taskCalendarDetailList"),
  selectVisibleTasksButton: document.querySelector("#selectVisibleTasksButton"),
  selectedTaskCountBadge: document.querySelector("#selectedTaskCountBadge"),
  bulkStatusInput: document.querySelector("#bulkStatusInput"),
  applyBulkStatusButton: document.querySelector("#applyBulkStatusButton"),
  taskDetailList: document.querySelector("#taskDetailList"),
  appDetailAppCountBadge: document.querySelector("#appDetailAppCountBadge"),
  appDetailProjectName: document.querySelector("#appDetailProjectName"),
  appDetailAppPanelButton: document.querySelector("#appDetailAppPanelButton"),
  appDetailVersionPanelButton: document.querySelector("#appDetailVersionPanelButton"),
  appDetailPanelBackdrop: document.querySelector("#appDetailPanelBackdrop"),
  appDetailAppPanel: document.querySelector("#appDetailAppPanel"),
  appDetailVersionPanel: document.querySelector("#appDetailVersionPanel"),
  appDetailPanelCloseButtons: document.querySelectorAll("[data-app-detail-panel-close]"),
  projectEditDialogBackdrop: document.querySelector("#projectEditDialogBackdrop"),
  projectEditDialog: document.querySelector("#projectEditDialog"),
  projectEditDialogCloseButton: document.querySelector("#projectEditDialogCloseButton"),
  projectCreateDialogBackdrop: document.querySelector("#projectCreateDialogBackdrop"),
  projectCreateDialog: document.querySelector("#projectCreateDialog"),
  projectCreateDialogForm: document.querySelector("#projectCreateDialogForm"),
  projectCreateDialogNameInput: document.querySelector("#projectCreateDialogNameInput"),
  projectCreateDialogColorInput: document.querySelector("#projectCreateDialogColorInput"),
  projectCreateDialogDescriptionInput: document.querySelector(
    "#projectCreateDialogDescriptionInput"
  ),
  projectCreateDialogCloseButton: document.querySelector("#projectCreateDialogCloseButton"),
  projectCreateDialogCancelButton: document.querySelector("#projectCreateDialogCancelButton"),
  appFormCopy: document.querySelector("#appFormCopy"),
  appDetailAppSelect: document.querySelector("#appDetailAppSelect"),
  appForm: document.querySelector("#appForm"),
  appIdInput: document.querySelector("#appIdInput"),
  appNameInput: document.querySelector("#appNameInput"),
  appColorInput: document.querySelector("#appColorInput"),
  appPlatformInput: document.querySelector("#appPlatformInput"),
  appBundleIdInput: document.querySelector("#appBundleIdInput"),
  appDescriptionInput: document.querySelector("#appDescriptionInput"),
  appSubmitButton: document.querySelector("#appSubmitButton"),
  appNewButton: document.querySelector("#appNewButton"),
  appArchiveButton: document.querySelector("#appArchiveButton"),
  appDeleteButton: document.querySelector("#appDeleteButton"),
  versionEditorModeBadge: document.querySelector("#versionEditorModeBadge"),
  versionAppHint: document.querySelector("#versionAppHint"),
  versionForm: document.querySelector("#versionForm"),
  versionIdInput: document.querySelector("#versionIdInput"),
  versionNameInput: document.querySelector("#versionNameInput"),
  buildNumberInput: document.querySelector("#buildNumberInput"),
  resourceVersionInput: document.querySelector("#resourceVersionInput"),
  versionDescriptionInput: document.querySelector("#versionDescriptionInput"),
  versionNotesInput: document.querySelector("#versionNotesInput"),
  versionOwnerInput: document.querySelector("#versionOwnerInput"),
  versionChannelInput: document.querySelector("#versionChannelInput"),
  versionStatusInput: document.querySelector("#versionStatusInput"),
  versionPriorityInput: document.querySelector("#versionPriorityInput"),
  plannedDateInput: document.querySelector("#plannedDateInput"),
  releaseDateInput: document.querySelector("#releaseDateInput"),
  publishedDateInput: document.querySelector("#publishedDateInput"),
  versionSubmitButton: document.querySelector("#versionSubmitButton"),
  versionResetButton: document.querySelector("#versionResetButton"),
  versionListSummary: document.querySelector("#versionListSummary"),
  appDetailCurrentMeta: document.querySelector("#appDetailCurrentMeta"),
  versionSearchInput: document.querySelector("#versionSearchInput"),
  versionBundleIdDisplayInput: document.querySelector("#versionBundleIdDisplayInput"),
  versionStatusFilterInput: document.querySelector("#versionStatusFilterInput"),
  versionChannelFilterInput: document.querySelector("#versionChannelFilterInput"),
  selectVisibleVersionsButton: document.querySelector("#selectVisibleVersionsButton"),
  selectedVersionCountBadge: document.querySelector("#selectedVersionCountBadge"),
  bulkVersionStatusInput: document.querySelector("#bulkVersionStatusInput"),
  applyBulkVersionStatusButton: document.querySelector("#applyBulkVersionStatusButton"),
  versionDetailList: document.querySelector("#versionDetailList"),
  projectScopeBadge: document.querySelector("#projectScopeBadge"),
  projectSelect: document.querySelector("#projectSelect"),
  dataCurrentProject: document.querySelector("#dataCurrentProject"),
  dataProjectCount: document.querySelector("#dataProjectCount"),
  dataTaskCount: document.querySelector("#dataTaskCount"),
  dataTagCount: document.querySelector("#dataTagCount"),
  dataAppCount: document.querySelector("#dataAppCount"),
  dataVersionCount: document.querySelector("#dataVersionCount"),
  dataDoneCount: document.querySelector("#dataDoneCount"),
  dataGuestSummary: document.querySelector("#dataGuestSummary"),
  utilityContextCopy: document.querySelector("#utilityContextCopy"),
  utilityWorkspaceMode: document.querySelector("#utilityWorkspaceMode"),
  utilityCurrentProject: document.querySelector("#utilityCurrentProject"),
  utilityTaskCount: document.querySelector("#utilityTaskCount"),
  utilityPendingTaskCount: document.querySelector("#utilityPendingTaskCount"),
  loadDemoButton: document.querySelector("#loadDemoButton"),
  importJsonButton: document.querySelector("#importJsonButton"),
  exportJsonButton: document.querySelector("#exportJsonButton"),
  exportWorkspaceButton: document.querySelector("#exportWorkspaceButton"),
  refreshWorkspaceButton: document.querySelector("#refreshWorkspaceButton"),
  openCurrentProjectDetailsButton: document.querySelector("#openCurrentProjectDetailsButton"),
  copyWorkspaceSummaryButton: document.querySelector("#copyWorkspaceSummaryButton"),
  copyProjectSummaryButton: document.querySelector("#copyProjectSummaryButton"),
  copyPendingTaskListButton: document.querySelector("#copyPendingTaskListButton"),
  copyProjectJsonButton: document.querySelector("#copyProjectJsonButton"),
  clearDoneButton: document.querySelector("#clearDoneButton"),
  clearGuestDataButton: document.querySelector("#clearGuestDataButton"),
  jsonImportInput: document.querySelector("#jsonImportInput"),
  authCopy: document.querySelector("#authCopy"),
  authForm: document.querySelector("#authForm"),
  authModeButtons: document.querySelectorAll("[data-auth-mode]"),
  authUsernameInput: document.querySelector("#authUsernameInput"),
  authPasswordInput: document.querySelector("#authPasswordInput"),
  authSubmitButton: document.querySelector("#authSubmitButton"),
  authUserCard: document.querySelector("#authUserCard"),
  authUsernameLabel: document.querySelector("#authUsernameLabel"),
  authWorkspaceCopy: document.querySelector("#authWorkspaceCopy"),
  themeModeCopy: document.querySelector("#themeModeCopy"),
  themeModeButtons: document.querySelectorAll("[data-theme-mode]"),
  refreshSessionButton: document.querySelector("#refreshSessionButton"),
  logoutButton: document.querySelector("#logoutButton"),
  syncMessage: document.querySelector("#syncMessage"),
  importGuestButton: document.querySelector("#importGuestButton"),
  toast: document.querySelector("#toast"),
};

init();

async function init() {
  applyThemeMode(state.ui.themeMode);
  bindEvents();
  updateTodayLabel();

  await restoreSession();
  await loadWorkspaceForCurrentMode();
  render();
}

function bindEvents() {
  elements.toolboxNav.addEventListener("click", handleToolboxNavigation);
  elements.projectOverviewList.addEventListener("click", handleOverviewProjectAction);
  elements.appVersionOverviewList.addEventListener("click", handleAppOverviewAction);
  elements.projectSelect.addEventListener("change", handleProjectSelectionChange);
  elements.projectManagerList.addEventListener("click", handleProjectManagerListClick);
  elements.detailProjectSelect.addEventListener("change", handleDetailProjectSelectionChange);
  elements.scheduleProjectSelect.addEventListener("change", handleScheduleProjectSelectionChange);
  elements.kioskProjectSelect.addEventListener("change", handleKioskProjectSelectionChange);
  elements.appDetailAppSelect.addEventListener("change", handleAppDetailSelectionChange);
  elements.detailProjectPanelButton.addEventListener("click", handleOpenProjectPanel);
  elements.scheduleProjectPanelButton.addEventListener("click", handleOpenProjectPanel);
  elements.kioskProjectPanelButton.addEventListener("click", handleOpenProjectPanel);
  elements.detailTaskPanelButton.addEventListener("click", handleOpenTaskPanel);
  elements.projectKioskNewButton.addEventListener("click", handleOpenKioskPanel);
  elements.appDetailAppPanelButton.addEventListener("click", handleOpenAppPanel);
  elements.appDetailVersionPanelButton.addEventListener("click", handleOpenVersionPanel);
  elements.detailPanelBackdrop.addEventListener("click", closeDetailPanel);
  elements.kioskDetailPanelBackdrop.addEventListener("click", closeKioskDetailPanel);
  elements.appDetailPanelBackdrop.addEventListener("click", closeAppDetailPanel);
  elements.projectEditDialogBackdrop.addEventListener("click", closeProjectEditDialog);
  elements.projectCreateDialogBackdrop.addEventListener("click", closeProjectCreateDialog);
  elements.detailPanelCloseButtons.forEach((button) => {
    button.addEventListener("click", closeDetailPanel);
  });
  elements.kioskDetailPanelCloseButtons.forEach((button) => {
    button.addEventListener("click", closeKioskDetailPanel);
  });
  elements.appDetailPanelCloseButtons.forEach((button) => {
    button.addEventListener("click", closeAppDetailPanel);
  });
  elements.projectEditDialogCloseButton.addEventListener("click", closeProjectEditDialog);
  elements.projectCreateDialogCloseButton.addEventListener("click", closeProjectCreateDialog);
  elements.projectCreateDialogCancelButton.addEventListener("click", closeProjectCreateDialog);
  elements.projectForm.addEventListener("submit", handleProjectFormSubmit);
  elements.projectCreateDialogForm.addEventListener("submit", handleProjectCreateDialogSubmit);
  elements.projectNewButton.addEventListener("click", handleProjectNewClick);
  elements.projectArchiveButton.addEventListener("click", handleProjectArchiveToggle);
  elements.projectDeleteButton.addEventListener("click", handleProjectDelete);
  elements.tagForm.addEventListener("submit", handleTagFormSubmit);
  elements.tagResetButton.addEventListener("click", handleTagReset);
  elements.detailTagList.addEventListener("click", handleTagListClick);
  elements.kioskPlatformSelect.addEventListener("change", handleKioskPlatformSelectChange);
  elements.kioskRemotePlatformSelect.addEventListener(
    "change",
    handleKioskRemotePlatformSelectChange
  );
  elements.kioskActiveAppSelect.addEventListener("change", handleKioskActiveAppSelectChange);
  elements.kioskRegionFilterInput.addEventListener("change", handleKioskRegionFilterChange);
  elements.kioskForm.addEventListener("submit", handleKioskFormSubmit);
  elements.kioskResetButton.addEventListener("click", handleKioskReset);
  elements.projectKioskList.addEventListener("click", handleKioskListClick);
  elements.taskForm.addEventListener("submit", handleTaskFormSubmit);
  elements.taskResetButton.addEventListener("click", handleTaskReset);
  elements.taskTagPicker.addEventListener("click", handleTaskTagPickerClick);
  elements.statusInput.addEventListener("change", handleTaskFormStatusChange);
  elements.taskSearchInput.addEventListener("input", handleTaskSearchInput);
  elements.taskStatusFilterInput.addEventListener("change", handleTaskFilterChange);
  elements.taskTagFilterInput.addEventListener("change", handleTaskFilterChange);
  elements.taskCalendarGrid.addEventListener("click", handleTaskCalendarDayClick);
  elements.taskCalendarPrevButton.addEventListener("click", () => shiftTaskCalendarMonth(-1));
  elements.taskCalendarTodayButton.addEventListener("click", handleTaskCalendarTodayClick);
  elements.taskCalendarNextButton.addEventListener("click", () => shiftTaskCalendarMonth(1));
  elements.selectVisibleTasksButton.addEventListener("click", handleSelectVisibleTasks);
  elements.applyBulkStatusButton.addEventListener("click", handleApplyBulkStatus);
  elements.taskDetailList.addEventListener("click", handleTaskListClick);
  elements.taskDetailList.addEventListener("change", handleTaskListChange);
  elements.appForm.addEventListener("submit", handleAppFormSubmit);
  elements.appNewButton.addEventListener("click", handleAppNewClick);
  elements.appArchiveButton.addEventListener("click", handleAppArchiveToggle);
  elements.appDeleteButton.addEventListener("click", handleAppDelete);
  elements.versionForm.addEventListener("submit", handleVersionFormSubmit);
  elements.versionResetButton.addEventListener("click", handleVersionReset);
  elements.versionStatusInput.addEventListener("change", handleVersionFormStatusChange);
  elements.versionSearchInput.addEventListener("input", handleVersionSearchInput);
  elements.versionStatusFilterInput.addEventListener("change", handleVersionFilterChange);
  elements.versionChannelFilterInput.addEventListener("change", handleVersionFilterChange);
  elements.selectVisibleVersionsButton.addEventListener("click", handleSelectVisibleVersions);
  elements.applyBulkVersionStatusButton.addEventListener("click", handleApplyBulkVersionStatus);
  elements.versionDetailList.addEventListener("click", handleVersionListClick);
  elements.versionDetailList.addEventListener("change", handleVersionListChange);
  elements.authForm.addEventListener("submit", handleAuthSubmit);
  elements.refreshSessionButton.addEventListener("click", handleRefreshSession);
  elements.logoutButton.addEventListener("click", handleLogout);

  elements.authModeButtons.forEach((button) => {
    button.addEventListener("click", handleAuthModeChange);
  });
  elements.themeModeButtons.forEach((button) => {
    button.addEventListener("click", handleThemeModeChange);
  });

  elements.loadDemoButton.addEventListener("click", handleLoadDemo);
  elements.importJsonButton.addEventListener("click", () => {
    elements.jsonImportInput.click();
  });
  elements.jsonImportInput.addEventListener("change", handleImportJsonFile);
  elements.exportJsonButton.addEventListener("click", handleExportJson);
  elements.exportWorkspaceButton.addEventListener("click", handleExportWorkspaceJson);
  elements.refreshWorkspaceButton.addEventListener("click", handleRefreshWorkspace);
  elements.openCurrentProjectDetailsButton.addEventListener(
    "click",
    handleOpenCurrentProjectDetails
  );
  elements.copyWorkspaceSummaryButton.addEventListener("click", handleCopyWorkspaceSummary);
  elements.copyProjectSummaryButton.addEventListener("click", handleCopyCurrentProjectSummary);
  elements.copyPendingTaskListButton.addEventListener("click", handleCopyPendingTaskList);
  elements.copyProjectJsonButton.addEventListener("click", handleCopyCurrentProjectJson);
  elements.clearDoneButton.addEventListener("click", handleClearCompleted);
  elements.clearGuestDataButton.addEventListener("click", handleClearGuestData);
  elements.importGuestButton.addEventListener("click", handleImportGuestToCloud);
  document.addEventListener("keydown", handleGlobalKeydown);
}

async function handleToolboxNavigation(event) {
  const groupToggle = event.target.closest("[data-group-toggle]");
  if (groupToggle) {
    toggleToolGroup(groupToggle.dataset.groupToggle);
    return;
  }

  const actionButton = event.target.closest("[data-tool-action]");
  if (actionButton) {
    if (actionButton.disabled) {
      return;
    }

    await handleToolboxAction(actionButton.dataset.toolAction);
    return;
  }

  const button = event.target.closest("[data-tool]");
  if (!button) {
    return;
  }

  setActiveTool(button.dataset.tool);
}

function setActiveTool(tool) {
  const nextTool = TOOL_META[tool] ? tool : "overview";
  const nextGroup = TOOL_META[nextTool]?.group;

  state.ui.activeTool = nextTool;
  if (nextTool !== "details") {
    state.ui.activeDetailPanel = null;
  }
  if (nextTool !== "kiosk-details") {
    state.ui.activeKioskDetailPanel = null;
  }
  if (nextTool !== "app-details") {
    state.ui.activeAppDetailPanel = null;
  }
  if (nextGroup) {
    state.ui.collapsedGroups[nextGroup] = false;
  }

  render();
}

function toggleToolGroup(groupId) {
  if (!(groupId in state.ui.collapsedGroups)) {
    return;
  }

  state.ui.collapsedGroups[groupId] = !state.ui.collapsedGroups[groupId];
  renderToolbox();
}

async function handleToolboxAction(action) {
  switch (action) {
    case "refresh-workspace":
      await handleRefreshWorkspace();
      return;
    case "open-current-project":
      await handleOpenCurrentProjectDetails();
      return;
    case "copy-workspace-summary":
      await handleCopyWorkspaceSummary();
      return;
    case "copy-project-summary":
      await handleCopyCurrentProjectSummary();
      return;
    case "copy-pending-tasks":
      await handleCopyPendingTaskList();
      return;
    case "copy-project-json":
      await handleCopyCurrentProjectJson();
      return;
    case "export-workspace":
      await handleExportWorkspaceJson();
      return;
    default:
      return;
  }
}

function toggleExpandedId(listName, id) {
  const value = String(id || "");
  if (!value || !Array.isArray(state.ui[listName])) {
    return;
  }

  const next = new Set(state.ui[listName]);
  if (next.has(value)) {
    next.delete(value);
  } else {
    next.add(value);
  }

  state.ui[listName] = [...next];
}

async function handleOverviewProjectAction(event) {
  const collapseButton = event.target.closest("[data-project-collapse-id]");
  if (collapseButton) {
    toggleExpandedId("expandedOverviewProjectIds", collapseButton.dataset.projectCollapseId);
    renderOverview();
    return;
  }

  const button = event.target.closest("[data-open-project-id]");
  if (!button) {
    return;
  }

  await openProjectDetails(button.dataset.openProjectId);
}

async function openProjectDetails(projectId) {
  if (!projectId) {
    return;
  }

  state.ui.projectFormMode = "edit";
  state.ui.editingProjectId = projectId;
  state.ui.editingTaskId = null;
  await setCurrentProject(projectId, { nextTool: "details" });
}

async function handleProjectSelectionChange(event) {
  const selectedProjectId = event.target.value;
  if (!selectedProjectId) {
    return;
  }

  await setCurrentProject(selectedProjectId);
}

async function handleDetailProjectSelectionChange(event) {
  const selectedProjectId = event.target.value;
  if (!selectedProjectId) {
    return;
  }

  state.ui.projectFormMode = "edit";
  state.ui.editingProjectId = selectedProjectId;
  state.ui.editingTaskId = null;
  await setCurrentProject(selectedProjectId, { nextTool: "details" });
}

async function handleScheduleProjectSelectionChange(event) {
  const selectedValue = event.target.value;
  if (!selectedValue) {
    return;
  }

  if (selectedValue === SCHEDULE_ALL_PROJECTS_VALUE) {
    state.ui.scheduleProjectFilter = SCHEDULE_ALL_PROJECTS_VALUE;
    state.ui.editingTaskId = null;
    renderSchedule();
    await loadCloudScheduleAllProjects();
    return;
  }

  state.ui.projectFormMode = "edit";
  state.ui.scheduleProjectFilter = selectedValue;
  state.ui.editingProjectId = selectedValue;
  state.ui.editingTaskId = null;
  await setCurrentProject(selectedValue, { nextTool: "schedule" });
}

async function handleKioskProjectSelectionChange(event) {
  const selectedProjectId = event.target.value;
  if (!selectedProjectId) {
    return;
  }

  state.ui.projectFormMode = "edit";
  state.ui.editingProjectId = selectedProjectId;
  state.ui.editingKioskId = null;
  await setCurrentProject(selectedProjectId, { nextTool: "kiosk-details" });
}

async function handleProjectManagerListClick(event) {
  const button = event.target.closest("[data-project-action]");
  if (!button) {
    return;
  }

  const projectId = button.dataset.projectId;
  if (!projectId) {
    return;
  }

  if (button.dataset.projectAction === "edit") {
    await openProjectEditDialog(projectId);
    return;
  }

  if (button.dataset.projectAction === "switch") {
    state.ui.projectFormMode = "edit";
    state.ui.editingProjectId = projectId;
    state.ui.editingTagId = null;
    await setCurrentProject(projectId, { nextTool: "projects" });
    return;
  }

  if (button.dataset.projectAction === "delete") {
    await handleProjectDelete(projectId);
  }
}

function handleOpenKioskPanel() {
  state.ui.editingKioskId = null;
  state.ui.activeKioskDetailPanel = "editor";
  render();

  window.requestAnimationFrame(() => {
    if (
      typeof elements.kioskRegionInput.focus === "function" &&
      !elements.kioskRegionInput.disabled
    ) {
      elements.kioskRegionInput.focus();
    }
  });
}

function resetProjectCreateDialogForm() {
  elements.projectCreateDialogForm.reset();
  elements.projectCreateDialogColorInput.value = "#c16b39";
}

async function openProjectEditDialog(projectId) {
  if (!projectId) {
    return;
  }

  state.ui.activeDetailPanel = null;
  state.ui.activeKioskDetailPanel = null;
  state.ui.activeAppDetailPanel = null;
  state.ui.projectCreateDialogOpen = false;
  state.ui.projectFormMode = "edit";
  state.ui.editingProjectId = projectId;
  state.ui.editingTagId = null;
  await setCurrentProject(projectId, { nextTool: "projects" });
  state.ui.projectEditDialogOpen = true;
  render();

  window.requestAnimationFrame(() => {
    if (typeof elements.projectNameInput.focus === "function" && !elements.projectNameInput.disabled) {
      elements.projectNameInput.focus();
    }
  });
}

function closeProjectEditDialog() {
  if (!state.ui.projectEditDialogOpen) {
    return;
  }

  state.ui.projectEditDialogOpen = false;
  state.ui.editingTagId = null;
  render();
}

function openProjectCreateDialog() {
  state.ui.activeDetailPanel = null;
  state.ui.activeKioskDetailPanel = null;
  state.ui.activeAppDetailPanel = null;
  state.ui.projectEditDialogOpen = false;
  state.ui.projectCreateDialogOpen = true;
  render();
  resetProjectCreateDialogForm();

  window.requestAnimationFrame(() => {
    if (
      typeof elements.projectCreateDialogNameInput.focus === "function" &&
      !elements.projectCreateDialogNameInput.disabled
    ) {
      elements.projectCreateDialogNameInput.focus();
    }
  });
}

function closeProjectCreateDialog() {
  if (!state.ui.projectCreateDialogOpen) {
    return;
  }

  state.ui.projectCreateDialogOpen = false;
  render();
}

function handleOpenProjectPanel() {
  state.ui.activeDetailPanel = null;
  state.ui.activeKioskDetailPanel = null;
  setActiveTool("projects");

  window.requestAnimationFrame(() => {
    if (typeof elements.projectNewButton.focus === "function" && !elements.projectNewButton.disabled) {
      elements.projectNewButton.focus();
    }
  });
}

function handleOpenTaskPanel() {
  state.ui.editingTaskId = null;
  state.ui.activeDetailPanel = "task";
  render();

  window.requestAnimationFrame(() => {
    if (typeof elements.titleInput.focus === "function" && !elements.titleInput.disabled) {
      elements.titleInput.focus();
    }
  });
}

function closeDetailPanel() {
  const activePanel = state.ui.activeDetailPanel;
  if (!activePanel) {
    return;
  }

  if (activePanel === "task") {
    state.ui.editingTaskId = null;
  }

  state.ui.activeDetailPanel = null;
  render();
}

function closeKioskDetailPanel() {
  if (!state.ui.activeKioskDetailPanel) {
    return;
  }

  state.ui.editingKioskId = null;
  state.ui.activeKioskDetailPanel = null;
  render();
}

function handleGlobalKeydown(event) {
  if (event.key !== "Escape") {
    return;
  }

  if (state.ui.projectEditDialogOpen) {
    closeProjectEditDialog();
  }

  if (state.ui.projectCreateDialogOpen) {
    closeProjectCreateDialog();
  }

  if (state.ui.activeDetailPanel) {
    closeDetailPanel();
  }

  if (state.ui.activeKioskDetailPanel) {
    closeKioskDetailPanel();
  }

  if (state.ui.activeAppDetailPanel) {
    closeAppDetailPanel();
  }
}

async function setCurrentProject(projectId, options = {}) {
  const {
    nextTool = null,
    silent = false,
    preserveProjectCreateMode = false,
    preserveAppCreateMode = false,
  } = options;
  const previousProjectId = state.workspace.currentProjectId;

  if (state.workspace.mode === "cloud") {
    await loadCloudWorkspace({
      projectId,
      silent,
      preserveProjectCreateMode,
    });
    await loadCloudAppWorkspace({
      projectId: projectId || state.workspace.currentProjectId,
      appId: state.appWorkspace.currentAppId,
      silent,
      preserveAppCreateMode,
    });
  } else {
    state.guestWorkspace.currentProjectId = projectId;
    persistGuestWorkspace();
    syncGuestView(projectId, { preserveProjectCreateMode });
    syncGuestAppView(state.appWorkspace.currentAppId, {
      projectId,
      preserveAppCreateMode,
    });
  }

  if (projectId && projectId !== previousProjectId) {
    if (state.ui.scheduleProjectFilter !== SCHEDULE_ALL_PROJECTS_VALUE) {
      state.ui.scheduleProjectFilter = projectId;
    }
    state.ui.editingTagId = null;
    state.ui.editingKioskId = null;
    state.ui.editingTaskId = null;
    state.ui.kioskRegionFilter = "all";
    state.ui.expandedTaskRecordIds = [];
    state.ui.selectedTaskIds = [];
    state.ui.taskCalendarMonth = getCalendarMonthKey(todayString());
    state.ui.taskCalendarSelectedDate = todayString();
    state.ui.expandedVersionRecordIds = [];
    state.ui.selectedVersionIds = [];
    resetTaskDetailFilters();
    resetVersionDetailFilters();
  }

  if (nextTool) {
    state.ui.activeTool = nextTool;
    const nextGroup = TOOL_META[nextTool]?.group;
    if (nextGroup) {
      state.ui.collapsedGroups[nextGroup] = false;
    }
  }

  render();
}

async function handleAppOverviewAction(event) {
  const collapseButton = event.target.closest("[data-app-collapse-id]");
  if (collapseButton) {
    toggleExpandedId("expandedAppOverviewIds", collapseButton.dataset.appCollapseId);
    renderAppOverview();
    return;
  }

  const button = event.target.closest("[data-open-app-id]");
  if (!button) {
    return;
  }

  await openAppDetails(button.dataset.openAppId);
}

async function openAppDetails(appId) {
  if (!appId) {
    return;
  }

  state.ui.appFormMode = "edit";
  state.ui.editingAppId = appId;
  state.ui.editingVersionId = null;
  await setCurrentApp(appId, { nextTool: "app-details" });
}

async function handleAppDetailSelectionChange(event) {
  const selectedAppId = event.target.value;
  if (!selectedAppId) {
    return;
  }

  state.ui.appFormMode = "edit";
  state.ui.editingAppId = selectedAppId;
  state.ui.editingVersionId = null;
  await setCurrentApp(selectedAppId, { nextTool: "app-details" });
}

function handleOpenAppPanel() {
  const currentApp = state.appWorkspace.currentApp;

  if (!currentApp) {
    state.ui.appFormMode = "create";
    state.ui.editingAppId = null;
  } else if (state.ui.appFormMode !== "create") {
    state.ui.appFormMode = "edit";
    state.ui.editingAppId = currentApp.id;
  }

  state.ui.activeAppDetailPanel = "app";
  render();

  window.requestAnimationFrame(() => {
    if (typeof elements.appNameInput.focus === "function" && !elements.appNameInput.disabled) {
      elements.appNameInput.focus();
    }
  });
}

function handleOpenVersionPanel() {
  state.ui.editingVersionId = null;
  state.ui.activeAppDetailPanel = "version";
  render();

  window.requestAnimationFrame(() => {
    if (
      typeof elements.versionNameInput.focus === "function" &&
      !elements.versionNameInput.disabled
    ) {
      elements.versionNameInput.focus();
    }
  });
}

function closeAppDetailPanel() {
  const activePanel = state.ui.activeAppDetailPanel;
  if (!activePanel) {
    return;
  }

  if (activePanel === "app") {
    if (state.appWorkspace.currentApp) {
      state.ui.appFormMode = "edit";
      state.ui.editingAppId = state.appWorkspace.currentApp.id;
    } else {
      state.ui.appFormMode = "create";
      state.ui.editingAppId = null;
    }
  }

  if (activePanel === "version") {
    state.ui.editingVersionId = null;
  }

  state.ui.activeAppDetailPanel = null;
  render();
}

async function setCurrentApp(appId, options = {}) {
  const { nextTool = null, silent = false, preserveAppCreateMode = false } = options;
  const previousAppId = state.appWorkspace.currentAppId;

  if (state.appWorkspace.mode === "cloud") {
    await loadCloudAppWorkspace({
      projectId: state.workspace.currentProjectId,
      appId,
      silent,
      preserveAppCreateMode,
    });
  } else {
    state.guestWorkspace.currentAppId = appId;
    persistGuestWorkspace();
    syncGuestAppView(appId, {
      projectId: state.workspace.currentProjectId,
      preserveAppCreateMode,
    });
  }

  if (appId && appId !== previousAppId) {
    state.ui.editingVersionId = null;
    state.ui.expandedVersionRecordIds = [];
    state.ui.selectedVersionIds = [];
    resetVersionDetailFilters();
  }

  if (nextTool) {
    state.ui.activeTool = nextTool;
    const nextGroup = TOOL_META[nextTool]?.group;
    if (nextGroup) {
      state.ui.collapsedGroups[nextGroup] = false;
    }
  }

  render();
}

function handleProjectNewClick() {
  openProjectCreateDialog();
}

async function handleProjectCreateDialogSubmit(event) {
  event.preventDefault();

  const projectName = elements.projectCreateDialogNameInput.value.trim();
  const description = elements.projectCreateDialogDescriptionInput.value.trim();
  const color = elements.projectCreateDialogColorInput.value;

  if (!projectName) {
    showToast("请输入项目名称");
    return;
  }

  const payload = {
    name: projectName,
    description,
    color,
  };
  const nextTool = state.ui.activeTool;

  try {
    let projectId = "";

    if (state.workspace.mode === "cloud") {
      const response = await apiRequest("/api/projects", {
        method: "POST",
        body: payload,
      });
      projectId = response.project?.id || "";
    } else {
      const project = createGuestProjectRecord(payload);
      projectId = project.id;
      updateGuestWorkspace((workspace) => {
        workspace.projects.unshift(project);
      });
    }

    state.ui.projectCreateDialogOpen = false;
    state.ui.projectFormMode = "edit";
    state.ui.editingProjectId = projectId || null;
    state.ui.editingTagId = null;
    state.ui.editingKioskId = null;
    state.ui.editingTaskId = null;
    state.ui.editingAppId = null;
    state.ui.editingVersionId = null;
    await setCurrentProject(projectId, { nextTool });
    showToast("项目已创建");
  } catch (error) {
    showToast(error.message || "项目创建失败");
  }
}

function handleAppNewClick() {
  state.ui.appFormMode = "create";
  state.ui.editingAppId = null;
  state.ui.activeAppDetailPanel = "app";
  render();
}

async function handleProjectFormSubmit(event) {
  event.preventDefault();

  const projectName = elements.projectNameInput.value.trim();
  const description = elements.projectDescriptionInput.value.trim();
  const color = elements.projectColorInput.value;

  if (!projectName) {
    showToast("请输入项目名称");
    return;
  }

  const payload = {
    name: projectName,
    description,
    color,
  };

  const isCreateMode =
    state.ui.projectFormMode === "create" || !state.workspace.currentProject;

  try {
    if (state.workspace.mode === "cloud") {
      if (isCreateMode) {
        const response = await apiRequest("/api/projects", {
          method: "POST",
          body: payload,
        });
        state.ui.projectFormMode = "edit";
        state.ui.editingProjectId = response.project?.id || null;
        state.ui.editingTaskId = null;
        await loadWorkspaceForCurrentMode({ projectId: response.project?.id || null });
        render();
        showToast("项目已创建");
        return;
      }

      const projectId = state.workspace.currentProject?.id;
      if (!projectId) {
        showToast("当前没有可更新的项目");
        return;
      }

      await apiRequest(`/api/projects/${projectId}`, {
        method: "PATCH",
        body: payload,
      });

      state.ui.projectFormMode = "edit";
      state.ui.editingProjectId = projectId;
      await loadWorkspaceForCurrentMode({ projectId });
      render();
      showToast("项目已保存");
      return;
    }

    if (isCreateMode) {
      const project = createGuestProjectRecord(payload);
      updateGuestWorkspace((workspace) => {
        if (isPlaceholderGuestWorkspace(workspace)) {
          workspace.projects = [project];
          workspace.tags = [];
          workspace.kiosks = [];
          workspace.tasks = [];
          workspace.apps = [];
          workspace.versions = [];
        } else {
          workspace.projects.unshift(project);
        }
        workspace.currentProjectId = project.id;
      });

      state.ui.projectFormMode = "edit";
      state.ui.editingProjectId = project.id;
      state.ui.editingTaskId = null;
      syncGuestView(project.id);
      syncGuestAppView(null, { projectId: project.id });
      render();
      showToast("项目已创建");
      return;
    }

    const projectId = state.workspace.currentProject?.id;
    if (!projectId) {
      showToast("当前没有可更新的项目");
      return;
    }

    updateGuestWorkspace((workspace) => {
      const timestamp = new Date().toISOString();
      workspace.projects = workspace.projects.map((project) =>
        project.id === projectId
          ? {
              ...project,
              ...payload,
              color: normalizeHexColor(payload.color, project.color),
              updatedAt: timestamp,
            }
          : project
      );
      workspace.currentProjectId = projectId;
    });

    state.ui.projectFormMode = "edit";
    state.ui.editingProjectId = projectId;
    syncGuestView(projectId);
    syncGuestAppView(state.appWorkspace.currentAppId, { projectId });
    render();
    showToast("项目已保存");
  } catch (error) {
    showToast(error.message);
  }
}

async function handleProjectArchiveToggle() {
  const currentProject = state.workspace.currentProject;
  if (!currentProject || state.ui.projectFormMode === "create") {
    showToast("请先选择一个项目");
    return;
  }

  try {
    if (state.workspace.mode === "cloud") {
      await apiRequest(`/api/projects/${currentProject.id}`, {
        method: "PATCH",
        body: {
          archived: !currentProject.archived,
        },
      });
      await loadWorkspaceForCurrentMode({ projectId: currentProject.id });
    } else {
      updateGuestWorkspace((workspace) => {
        const timestamp = new Date().toISOString();
        workspace.projects = workspace.projects.map((project) =>
          project.id === currentProject.id
            ? {
                ...project,
                archived: !project.archived,
                updatedAt: timestamp,
              }
            : project
        );
      });
      syncGuestView(currentProject.id);
      syncGuestAppView(state.appWorkspace.currentAppId, { projectId: currentProject.id });
    }

    render();
    showToast(currentProject.archived ? "项目已恢复" : "项目已归档");
  } catch (error) {
    showToast(error.message);
  }
}

async function handleProjectDelete(targetProjectId = null) {
  const resolvedProjectId =
    typeof targetProjectId === "string" ? targetProjectId : state.workspace.currentProject?.id;
  const currentProject = state.workspace.projects.find((project) => project.id === resolvedProjectId);

  if (!currentProject) {
    showToast("请先选择一个项目");
    return;
  }

  if (!window.confirm(`确认删除项目“${currentProject.name}”吗？`)) {
    return;
  }

  try {
    if (state.workspace.mode === "cloud") {
      await apiRequest(`/api/projects/${currentProject.id}`, {
        method: "DELETE",
      });
      state.ui.editingTaskId = null;
      state.ui.projectFormMode = "edit";
      if (resolvedProjectId === state.workspace.currentProject?.id) {
        state.ui.projectEditDialogOpen = false;
      }
      await loadWorkspaceForCurrentMode({
        projectId:
          resolvedProjectId === state.workspace.currentProject?.id
            ? null
            : state.workspace.currentProject?.id || null,
      });
    } else {
      updateGuestWorkspace((workspace) => {
        const removedAppIds = new Set(
          workspace.apps
            .filter((app) => app.projectId === currentProject.id)
            .map((app) => app.id)
        );
        workspace.projects = workspace.projects.filter(
          (project) => project.id !== currentProject.id
        );
        workspace.tags = workspace.tags.filter((tag) => tag.projectId !== currentProject.id);
        workspace.kiosks = workspace.kiosks.filter(
          (kiosk) => kiosk.projectId !== currentProject.id
        );
        workspace.tasks = workspace.tasks.filter(
          (task) => task.projectId !== currentProject.id
        );
        workspace.apps = workspace.apps.filter((app) => app.projectId !== currentProject.id);
        workspace.versions = workspace.versions.filter(
          (version) => !removedAppIds.has(version.appId)
        );
        if (workspace.currentProjectId === currentProject.id) {
          workspace.currentProjectId = null;
        }
      });
      state.ui.editingTaskId = null;
      state.ui.projectFormMode = "edit";
      if (resolvedProjectId === state.workspace.currentProject?.id) {
        state.ui.projectEditDialogOpen = false;
      }
      syncGuestView();
      syncGuestAppView();
    }

    render();
    showToast("项目已删除");
  } catch (error) {
    showToast(error.message);
  }
}

async function handleKioskFormSubmit(event) {
  event.preventDefault();

  const currentProject = state.workspace.currentProject;
  if (!currentProject) {
    showToast("请先选择项目");
    return;
  }

  const region = elements.kioskRegionInput.value.trim();
  const location = elements.kioskLocationInput.value.trim();
  if (!region || !location) {
    showToast("请填写所属地区和具体位置");
    return;
  }

  const payload = {
    region,
    location,
    printerConnection: elements.kioskPrinterConnectionInput.value || "usb",
    printerModel: elements.kioskPrinterModelInput.value.trim(),
    printerNotes: elements.kioskPrinterNotesInput.value.trim(),
    kioskPlatform: getSelectOrCustomInputValue(
      elements.kioskPlatformSelect,
      elements.kioskPlatformInput
    ),
    remotePlatform: getSelectOrCustomInputValue(
      elements.kioskRemotePlatformSelect,
      elements.kioskRemotePlatformInput
    ),
    remoteCode: elements.kioskRemoteCodeInput.value.trim(),
    activeAppId: elements.kioskActiveAppSelect.value || "",
    activeVersionId: elements.kioskActiveVersionSelect.value || "",
    notes: elements.kioskNotesInput.value.trim(),
  };
  const editingKioskId = state.ui.editingKioskId;

  try {
    if (state.workspace.mode === "cloud") {
      if (editingKioskId) {
        await apiRequest(`/api/kiosks/${editingKioskId}`, {
          method: "PATCH",
          body: payload,
        });
      } else {
        await apiRequest(`/api/projects/${currentProject.id}/kiosks`, {
          method: "POST",
          body: payload,
        });
      }

      state.ui.editingKioskId = null;
      state.ui.activeKioskDetailPanel = null;
      await loadCloudWorkspace({ projectId: currentProject.id });
      render();
      showToast(editingKioskId ? "Kiosk 已保存" : "Kiosk 已创建");
      return;
    }

    if (editingKioskId) {
      updateGuestWorkspace((workspace) => {
        const existingKiosk = workspace.kiosks.find((kiosk) => kiosk.id === editingKioskId);
        if (!existingKiosk) {
          return;
        }

        const timestamp = new Date().toISOString();
        workspace.kiosks = workspace.kiosks.map((kiosk) =>
          kiosk.id === editingKioskId
            ? {
                ...kiosk,
                ...payload,
                updatedAt: timestamp,
              }
            : kiosk
        );
        touchGuestProject(workspace, existingKiosk.projectId, timestamp);
      });
    } else {
      const kiosk = createGuestKioskRecord(currentProject.id, payload);
      updateGuestWorkspace((workspace) => {
        workspace.kiosks.unshift(kiosk);
        touchGuestProject(workspace, currentProject.id, kiosk.updatedAt);
      });
    }

    state.ui.editingKioskId = null;
    state.ui.activeKioskDetailPanel = null;
    syncGuestView(currentProject.id);
    render();
    showToast(editingKioskId ? "Kiosk 已保存" : "Kiosk 已创建");
  } catch (error) {
    showToast(error.message);
  }
}

function handleKioskPlatformSelectChange() {
  toggleSelectCustomInput(elements.kioskPlatformSelect, elements.kioskPlatformInput);
  if (
    elements.kioskPlatformSelect.value === "other" &&
    typeof elements.kioskPlatformInput.focus === "function" &&
    !elements.kioskPlatformInput.disabled
  ) {
    elements.kioskPlatformInput.focus();
  }
}

function handleKioskRemotePlatformSelectChange() {
  toggleSelectCustomInput(elements.kioskRemotePlatformSelect, elements.kioskRemotePlatformInput);
  if (
    elements.kioskRemotePlatformSelect.value === "other" &&
    typeof elements.kioskRemotePlatformInput.focus === "function" &&
    !elements.kioskRemotePlatformInput.disabled
  ) {
    elements.kioskRemotePlatformInput.focus();
  }
}

function handleKioskActiveAppSelectChange() {
  renderKioskActiveVersionOptions(elements.kioskActiveAppSelect.value, "");
}

function handleKioskRegionFilterChange(event) {
  state.ui.kioskRegionFilter = event.target.value || "all";
  renderKioskListPanel();
}

function handleKioskReset() {
  state.ui.editingKioskId = null;
  renderKioskEditor();
}

async function handleKioskListClick(event) {
  const actionButton = event.target.closest("[data-kiosk-action]");
  if (!actionButton) {
    return;
  }

  const kioskId = actionButton.dataset.kioskId;
  if (!kioskId) {
    return;
  }

  if (actionButton.dataset.kioskAction === "edit") {
    state.ui.editingKioskId = kioskId;
    state.ui.activeKioskDetailPanel = "editor";
    render();
    window.requestAnimationFrame(() => {
      if (
        typeof elements.kioskRegionInput.focus === "function" &&
        !elements.kioskRegionInput.disabled
      ) {
        elements.kioskRegionInput.focus();
      }
    });
    return;
  }

  if (actionButton.dataset.kioskAction !== "delete") {
    return;
  }

  const kiosk = state.workspace.kiosks.find((item) => item.id === kioskId);
  if (!kiosk) {
    showToast("Kiosk 不存在");
    return;
  }

  if (!window.confirm(`确认删除 Kiosk“${kiosk.region} / ${kiosk.location}”吗？`)) {
    return;
  }

  try {
    if (state.workspace.mode === "cloud") {
      await apiRequest(`/api/kiosks/${kioskId}`, {
        method: "DELETE",
      });
      await loadCloudWorkspace({ projectId: state.workspace.currentProjectId });
    } else {
      updateGuestWorkspace((workspace) => {
        workspace.kiosks = workspace.kiosks.filter((item) => item.id !== kioskId);
        touchGuestProject(workspace, kiosk.projectId, new Date().toISOString());
      });
      syncGuestView(state.workspace.currentProjectId);
    }

    if (state.ui.editingKioskId === kioskId) {
      state.ui.editingKioskId = null;
      state.ui.activeKioskDetailPanel = null;
    }

    render();
    showToast("Kiosk 已删除");
  } catch (error) {
    showToast(error.message);
  }
}

async function handleTagFormSubmit(event) {
  event.preventDefault();

  const currentProject = state.workspace.currentProject;
  if (!currentProject) {
    showToast("请先选择项目");
    return;
  }

  const name = elements.tagNameInput.value.trim();
  if (!name) {
    showToast("请输入标签名称");
    return;
  }

  const payload = {
    name,
    color: elements.tagColorInput.value,
  };
  const editingTagId = state.ui.editingTagId;

  try {
    if (state.workspace.mode === "cloud") {
      if (editingTagId) {
        await apiRequest(`/api/tags/${editingTagId}`, {
          method: "PATCH",
          body: payload,
        });
      } else {
        await apiRequest(`/api/projects/${currentProject.id}/tags`, {
          method: "POST",
          body: payload,
        });
      }

      state.ui.editingTagId = null;
      await loadCloudWorkspace({ projectId: currentProject.id });
      render();
      showToast(editingTagId ? "标签已保存" : "标签已创建");
      return;
    }

    assertGuestTagNameUnique(currentProject.id, name, editingTagId);
    if (editingTagId) {
      updateGuestWorkspace((workspace) => {
        workspace.tags = workspace.tags.map((tag) =>
          tag.id === editingTagId
            ? {
                ...tag,
                ...payload,
                color: normalizeHexColor(payload.color, tag.color),
              }
            : tag
        );
      });
    } else {
      updateGuestWorkspace((workspace) => {
        workspace.tags.push({
          id: createId(),
          projectId: currentProject.id,
          name,
          color: normalizeHexColor(payload.color, "#245a73"),
          createdAt: new Date().toISOString(),
        });
      });
    }

    state.ui.editingTagId = null;
    syncGuestView(currentProject.id);
    render();
    showToast(editingTagId ? "标签已保存" : "标签已创建");
  } catch (error) {
    showToast(error.message);
  }
}

function handleTagReset() {
  state.ui.editingTagId = null;
  renderTagManager();
}

async function handleTagListClick(event) {
  const actionButton = event.target.closest("[data-tag-action]");
  if (!actionButton) {
    return;
  }

  const tagId = actionButton.dataset.tagId;
  if (!tagId) {
    return;
  }

  if (actionButton.dataset.tagAction === "edit") {
    state.ui.editingTagId = tagId;
    renderTagManager();
    return;
  }

  if (actionButton.dataset.tagAction !== "delete") {
    return;
  }

  const tag = state.workspace.tags.find((item) => item.id === tagId);
  if (!tag) {
    showToast("标签不存在");
    return;
  }

  if (!window.confirm(`确认删除标签“${tag.name}”吗？`)) {
    return;
  }

  try {
    if (state.workspace.mode === "cloud") {
      await apiRequest(`/api/tags/${tagId}`, {
        method: "DELETE",
      });
      await loadCloudWorkspace({ projectId: state.workspace.currentProjectId });
    } else {
      updateGuestWorkspace((workspace) => {
        workspace.tags = workspace.tags.filter((item) => item.id !== tagId);
        workspace.tasks = workspace.tasks.map((task) => ({
          ...task,
          tagIds: task.tagIds.filter((item) => item !== tagId),
        }));
      });
      syncGuestView(state.workspace.currentProjectId);
    }

    if (state.ui.editingTagId === tagId) {
      state.ui.editingTagId = null;
    }
    if (state.ui.detailTagFilter === tagId) {
      state.ui.detailTagFilter = "all";
    }

    render();
    showToast("标签已删除");
  } catch (error) {
    showToast(error.message);
  }
}

async function handleTaskFormSubmit(event) {
  event.preventDefault();

  const currentProject = state.workspace.currentProject;
  if (!currentProject) {
    showToast("请先创建或选择项目");
    return;
  }

  const title = elements.titleInput.value.trim();
  if (!title) {
    showToast("请输入任务标题");
    return;
  }

  const payload = {
    title,
    description: elements.descriptionInput.value.trim(),
    notes: elements.notesInput.value.trim(),
    assignee: elements.assigneeInput.value.trim(),
    status: elements.statusInput.value,
    priority: elements.priorityInput.value,
    startDate: normalizeLocalDueDate(elements.startDateInput.value),
    dueDate: normalizeLocalDueDate(elements.dueDateInput.value),
    completedDate: normalizeLocalDueDate(elements.completedDateInput.value),
    tagIds: getSelectedTaskTagIds(),
    subtasks: parseSubtasksInput(elements.subtasksInput.value),
  };

  const editingTaskId = state.ui.editingTaskId;

  try {
    if (state.workspace.mode === "cloud") {
      if (editingTaskId) {
        await apiRequest(`/api/tasks/${editingTaskId}`, {
          method: "PATCH",
          body: payload,
        });
      } else {
        await apiRequest(`/api/projects/${currentProject.id}/tasks`, {
          method: "POST",
          body: payload,
        });
      }

      state.ui.editingTaskId = null;
      if (!editingTaskId) {
        state.ui.activeDetailPanel = null;
      }
      await loadCloudWorkspace({ projectId: currentProject.id });
      render();
      showToast(editingTaskId ? "任务已保存" : "任务已创建");
      return;
    }

    if (editingTaskId) {
      updateGuestWorkspace((workspace) => {
        const existingTask = workspace.tasks.find((task) => task.id === editingTaskId);
        if (!existingTask) {
          return;
        }

        const timestamp = new Date().toISOString();
        const nextSubtasks = buildGuestSubtasksForStorage(
          payload.subtasks,
          existingTask.subtasks,
          timestamp
        );
        workspace.tasks = workspace.tasks.map((task) =>
          task.id === editingTaskId
            ? {
                ...task,
                ...payload,
                assignee: payload.assignee,
                startDate: normalizeLocalDueDate(payload.startDate),
                completedDate: resolveGuestCompletedDateForStatus(
                  payload.status,
                  payload.completedDate,
                  {
                    previousStatus: task.status,
                    previousCompletedDate: task.completedDate,
                  }
                ),
                tagIds: payload.tagIds.map(String),
                subtasks: nextSubtasks,
                updatedAt: timestamp,
              }
            : task
        );
        touchGuestProject(workspace, existingTask.projectId, timestamp);
      });
    } else {
      const task = createGuestTaskRecord(currentProject.id, payload);
      updateGuestWorkspace((workspace) => {
        workspace.tasks.unshift(task);
        touchGuestProject(workspace, currentProject.id, task.updatedAt);
      });
    }

    state.ui.editingTaskId = null;
    if (!editingTaskId) {
      state.ui.activeDetailPanel = null;
    }
    syncGuestView(currentProject.id);
    render();
    showToast(editingTaskId ? "任务已保存" : "任务已创建");
  } catch (error) {
    showToast(error.message);
  }
}

function handleTaskReset() {
  state.ui.editingTaskId = null;
  renderTaskEditor();
}

function handleTaskTagPickerClick(event) {
  const button = event.target.closest("[data-tag-id]");
  if (!button || button.disabled) {
    return;
  }

  const isSelected = button.getAttribute("aria-pressed") === "true";
  button.setAttribute("aria-pressed", String(!isSelected));
  button.classList.toggle("is-selected", !isSelected);
}

function handleTaskSearchInput(event) {
  state.ui.detailSearch = event.target.value.trim();
  renderTaskListPanel();
}

function handleTaskFilterChange() {
  state.ui.detailStatusFilter = elements.taskStatusFilterInput.value || "all";
  state.ui.detailTagFilter = elements.taskTagFilterInput.value || "all";
  renderTaskListPanel();
}

function handleTaskCalendarDayClick(event) {
  const dayButton = event.target.closest("[data-calendar-date]");
  if (!dayButton || dayButton.disabled) {
    return;
  }

  const selectedDate = dayButton.dataset.calendarDate;
  if (!selectedDate) {
    return;
  }

  state.ui.taskCalendarSelectedDate = selectedDate;
  state.ui.taskCalendarMonth = getCalendarMonthKey(selectedDate);
  renderTaskCalendarPanel();
}

function handleTaskCalendarTodayClick() {
  const today = todayString();
  state.ui.taskCalendarSelectedDate = today;
  state.ui.taskCalendarMonth = getCalendarMonthKey(today);
  renderTaskCalendarPanel();
}

function shiftTaskCalendarMonth(offset) {
  const [year, month] = state.ui.taskCalendarMonth.split("-").map(Number);
  const nextMonth = new Date(year, month - 1 + offset, 1);
  state.ui.taskCalendarMonth = formatDateInputValue(nextMonth).slice(0, 7);

  if (state.ui.taskCalendarSelectedDate.slice(0, 7) !== state.ui.taskCalendarMonth) {
    state.ui.taskCalendarSelectedDate = `${state.ui.taskCalendarMonth}-01`;
  }

  renderTaskCalendarPanel();
}

function handleTaskFormStatusChange(event) {
  syncCompletedDateField(event.target.value);
}

function handleSelectVisibleTasks() {
  const visibleTaskIds = getFilteredDetailTasks(
    sortTasksForDisplay(state.workspace.tasks),
    state.workspace.tags
  ).map((task) => task.id);

  if (!visibleTaskIds.length) {
    showToast("当前没有可选择的任务");
    return;
  }

  const selectedIds = new Set(state.ui.selectedTaskIds);
  const areAllVisibleSelected = visibleTaskIds.every((taskId) => selectedIds.has(taskId));

  if (areAllVisibleSelected) {
    state.ui.selectedTaskIds = state.ui.selectedTaskIds.filter(
      (taskId) => !visibleTaskIds.includes(taskId)
    );
  } else {
    state.ui.selectedTaskIds = [...new Set([...state.ui.selectedTaskIds, ...visibleTaskIds])];
  }

  renderTaskListPanel();
}

async function handleApplyBulkStatus() {
  const currentProject = state.workspace.currentProject;
  const taskIds = state.ui.selectedTaskIds.filter((taskId) =>
    state.workspace.tasks.some((task) => task.id === taskId)
  );
  const status = elements.bulkStatusInput.value;

  if (!currentProject) {
    showToast("请先选择项目");
    return;
  }

  if (!taskIds.length) {
    showToast("请先勾选任务");
    return;
  }

  try {
    if (state.workspace.mode === "cloud") {
      await apiRequest(`/api/projects/${currentProject.id}/tasks`, {
        method: "PATCH",
        body: {
          taskIds,
          status,
        },
      });
      await loadCloudWorkspace({ projectId: currentProject.id });
    } else {
      updateGuestWorkspace((workspace) => {
        const timestamp = new Date().toISOString();
        workspace.tasks = workspace.tasks.map((task) =>
          taskIds.includes(task.id)
            ? {
                ...task,
                status,
                completedDate: resolveGuestCompletedDateForStatus(
                  status,
                  task.completedDate,
                  {
                    previousStatus: task.status,
                    previousCompletedDate: task.completedDate,
                  }
                ),
                updatedAt: timestamp,
              }
            : task
        );
        touchGuestProject(workspace, currentProject.id, timestamp);
      });
      syncGuestView(currentProject.id);
    }

    state.ui.selectedTaskIds = [];
    render();
    showToast(`已批量更新 ${taskIds.length} 项任务`);
  } catch (error) {
    showToast(error.message);
  }
}

async function handleTaskListClick(event) {
  const collapseButton = event.target.closest("[data-task-collapse-id]");
  if (collapseButton) {
    toggleExpandedId("expandedTaskRecordIds", collapseButton.dataset.taskCollapseId);
    renderTaskListPanel();
    return;
  }

  const actionButton = event.target.closest("[data-task-action]");
  if (!actionButton) {
    return;
  }

  const taskId = actionButton.dataset.taskId;
  if (!taskId) {
    return;
  }

  if (actionButton.dataset.taskAction === "edit") {
    state.ui.editingTaskId = taskId;
    state.ui.activeDetailPanel = "task";
    render();
    window.requestAnimationFrame(() => {
      if (typeof elements.titleInput.focus === "function" && !elements.titleInput.disabled) {
        elements.titleInput.focus();
      }
    });
    return;
  }

  if (actionButton.dataset.taskAction !== "delete") {
    return;
  }

  const task = state.workspace.tasks.find((item) => item.id === taskId);
  if (!task) {
    showToast("任务不存在");
    return;
  }

  if (!window.confirm(`确认删除任务“${task.title}”吗？`)) {
    return;
  }

  try {
    if (state.workspace.mode === "cloud") {
      await apiRequest(`/api/tasks/${taskId}`, {
        method: "DELETE",
      });
      state.ui.editingTaskId = null;
      state.ui.selectedTaskIds = state.ui.selectedTaskIds.filter((item) => item !== taskId);
      state.ui.expandedTaskRecordIds = state.ui.expandedTaskRecordIds.filter(
        (item) => item !== taskId
      );
      await loadCloudWorkspace({ projectId: state.workspace.currentProjectId });
    } else {
      updateGuestWorkspace((workspace) => {
        workspace.tasks = workspace.tasks.filter((item) => item.id !== taskId);
        touchGuestProject(workspace, task.projectId, new Date().toISOString());
      });
      state.ui.editingTaskId = null;
      state.ui.selectedTaskIds = state.ui.selectedTaskIds.filter((item) => item !== taskId);
      state.ui.expandedTaskRecordIds = state.ui.expandedTaskRecordIds.filter(
        (item) => item !== taskId
      );
      syncGuestView(state.workspace.currentProjectId);
    }

    render();
    showToast("任务已删除");
  } catch (error) {
    showToast(error.message);
  }
}

async function handleTaskListChange(event) {
  const selectionToggle = event.target.closest("[data-task-select-id]");
  if (selectionToggle) {
    const taskId = selectionToggle.dataset.taskSelectId;
    if (!taskId) {
      return;
    }

    if (selectionToggle.checked) {
      state.ui.selectedTaskIds = [...new Set([...state.ui.selectedTaskIds, taskId])];
    } else {
      state.ui.selectedTaskIds = state.ui.selectedTaskIds.filter((item) => item !== taskId);
    }

    renderTaskListPanel();
    return;
  }

  const subtaskToggle = event.target.closest("[data-subtask-id]");
  if (subtaskToggle) {
    const subtaskId = subtaskToggle.dataset.subtaskId;
    const taskId = subtaskToggle.dataset.parentTaskId;
    const nextCompleted = Boolean(subtaskToggle.checked);

    if (!subtaskId || !taskId) {
      showToast("子任务不存在");
      return;
    }

    try {
      if (state.workspace.mode === "cloud") {
        await apiRequest(`/api/subtasks/${subtaskId}`, {
          method: "PATCH",
          body: {
            completed: nextCompleted,
          },
        });
        await loadCloudWorkspace({ projectId: state.workspace.currentProjectId });
      } else {
        updateGuestWorkspace((workspace) => {
          const timestamp = new Date().toISOString();
          workspace.tasks = workspace.tasks.map((task) =>
            task.id === taskId
              ? {
                  ...task,
                  subtasks: task.subtasks.map((subtask) =>
                    subtask.id === subtaskId
                      ? {
                          ...subtask,
                          completed: nextCompleted,
                          updatedAt: timestamp,
                        }
                      : subtask
                  ),
                  updatedAt: timestamp,
                }
              : task
          );
          const task = workspace.tasks.find((item) => item.id === taskId);
          touchGuestProject(workspace, task?.projectId, timestamp);
        });
        syncGuestView(state.workspace.currentProjectId);
      }

      render();
      showToast("子任务状态已更新");
    } catch (error) {
      showToast(error.message);
    }
    return;
  }

  const statusSelect = event.target.closest("[data-task-status-id]");
  if (!statusSelect) {
    return;
  }

  const taskId = statusSelect.dataset.taskStatusId;
  const nextStatus = statusSelect.value;

  if (!taskId || !STATUS_META[nextStatus]) {
    showToast("任务状态无效");
    return;
  }

  const task = state.workspace.tasks.find((item) => item.id === taskId);
  if (!task) {
    showToast("任务不存在");
    return;
  }

  try {
    if (state.workspace.mode === "cloud") {
      await apiRequest(`/api/tasks/${taskId}`, {
        method: "PATCH",
        body: {
          status: nextStatus,
        },
      });
      await loadCloudWorkspace({ projectId: state.workspace.currentProjectId });
    } else {
      updateGuestWorkspace((workspace) => {
        const timestamp = new Date().toISOString();
        workspace.tasks = workspace.tasks.map((item) =>
          item.id === taskId
            ? {
                ...item,
                status: nextStatus,
                completedDate: resolveGuestCompletedDateForStatus(
                  nextStatus,
                  item.completedDate,
                  {
                    previousStatus: item.status,
                    previousCompletedDate: item.completedDate,
                  }
                ),
                updatedAt: timestamp,
              }
            : item
        );
        touchGuestProject(workspace, task.projectId, timestamp);
      });
      syncGuestView(state.workspace.currentProjectId);
    }

    render();
    showToast("任务状态已更新");
  } catch (error) {
    showToast(error.message);
  }
}

async function handleAppFormSubmit(event) {
  event.preventDefault();

  const currentProject = state.workspace.currentProject;
  if (!currentProject) {
    showToast("请先选择项目");
    return;
  }

  const appName = elements.appNameInput.value.trim();
  if (!appName) {
    showToast("请输入 App 名称");
    return;
  }

  const payload = {
    name: appName,
    description: elements.appDescriptionInput.value.trim(),
    color: elements.appColorInput.value,
    platform: elements.appPlatformInput.value,
    bundleId: elements.appBundleIdInput.value.trim(),
  };

  const isCreateMode = state.ui.appFormMode === "create" || !state.appWorkspace.currentApp;

  try {
    if (state.appWorkspace.mode === "cloud") {
      if (isCreateMode) {
        const response = await apiRequest(`/api/projects/${currentProject.id}/apps`, {
          method: "POST",
          body: payload,
        });
        state.ui.appFormMode = "edit";
        state.ui.editingAppId = response.app?.id || null;
        state.ui.editingVersionId = null;
        await loadCloudAppWorkspace({
          projectId: currentProject.id,
          appId: response.app?.id || null,
        });
        render();
        showToast("App 已创建");
        return;
      }

      const appId = state.appWorkspace.currentApp?.id;
      if (!appId) {
        showToast("当前没有可更新的 App");
        return;
      }

      await apiRequest(`/api/apps/${appId}`, {
        method: "PATCH",
        body: payload,
      });

      state.ui.appFormMode = "edit";
      state.ui.editingAppId = appId;
      await loadCloudAppWorkspace({ projectId: currentProject.id, appId });
      render();
      showToast("App 已保存");
      return;
    }

    if (isCreateMode) {
      const app = createGuestAppRecord(currentProject.id, payload);
      updateGuestWorkspace((workspace) => {
        workspace.apps.unshift(app);
        workspace.currentAppId = app.id;
      });

      state.ui.appFormMode = "edit";
      state.ui.editingAppId = app.id;
      state.ui.editingVersionId = null;
      syncGuestAppView(app.id, { projectId: currentProject.id });
      render();
      showToast("App 已创建");
      return;
    }

    const appId = state.appWorkspace.currentApp?.id;
    if (!appId) {
      showToast("当前没有可更新的 App");
      return;
    }

    updateGuestWorkspace((workspace) => {
      const timestamp = new Date().toISOString();
      workspace.apps = workspace.apps.map((app) =>
        app.id === appId
          ? {
              ...app,
              ...payload,
              color: normalizeHexColor(payload.color, app.color),
              updatedAt: timestamp,
            }
          : app
      );
      workspace.currentAppId = appId;
    });

    state.ui.appFormMode = "edit";
    state.ui.editingAppId = appId;
    syncGuestAppView(appId, { projectId: currentProject.id });
    render();
    showToast("App 已保存");
  } catch (error) {
    showToast(error.message);
  }
}

async function handleAppArchiveToggle() {
  const currentProject = state.workspace.currentProject;
  const currentApp = state.appWorkspace.currentApp;
  if (!currentProject || !currentApp || state.ui.appFormMode === "create") {
    showToast("请先选择一个 App");
    return;
  }

  try {
    if (state.appWorkspace.mode === "cloud") {
      await apiRequest(`/api/apps/${currentApp.id}`, {
        method: "PATCH",
        body: {
          archived: !currentApp.archived,
        },
      });
      await loadCloudAppWorkspace({ projectId: currentProject.id, appId: currentApp.id });
    } else {
      updateGuestWorkspace((workspace) => {
        const timestamp = new Date().toISOString();
        workspace.apps = workspace.apps.map((app) =>
          app.id === currentApp.id
            ? {
                ...app,
                archived: !app.archived,
                updatedAt: timestamp,
              }
            : app
        );
      });
      syncGuestAppView(currentApp.id, { projectId: currentProject.id });
    }

    render();
    showToast(currentApp.archived ? "App 已恢复" : "App 已归档");
  } catch (error) {
    showToast(error.message);
  }
}

async function handleAppDelete() {
  const currentProject = state.workspace.currentProject;
  const currentApp = state.appWorkspace.currentApp;
  if (!currentProject || !currentApp || state.ui.appFormMode === "create") {
    showToast("请先选择一个 App");
    return;
  }

  if (!window.confirm(`确认删除 App “${currentApp.name}”吗？`)) {
    return;
  }

  try {
    if (state.appWorkspace.mode === "cloud") {
      await apiRequest(`/api/apps/${currentApp.id}`, {
        method: "DELETE",
      });
      state.ui.editingVersionId = null;
      state.ui.appFormMode = "edit";
      await loadCloudAppWorkspace({ projectId: currentProject.id });
    } else {
      updateGuestWorkspace((workspace) => {
        workspace.apps = workspace.apps.filter((app) => app.id !== currentApp.id);
        workspace.versions = workspace.versions.filter(
          (version) => version.appId !== currentApp.id
        );
        workspace.kiosks = workspace.kiosks.map((kiosk) =>
          kiosk.activeAppId === currentApp.id
            ? {
                ...kiosk,
                activeAppId: "",
                activeVersionId: "",
              }
            : kiosk
        );
        if (workspace.currentAppId === currentApp.id) {
          workspace.currentAppId = null;
        }
      });
      state.ui.editingVersionId = null;
      state.ui.appFormMode = "edit";
      syncGuestAppView(null, { projectId: currentProject.id });
    }

    render();
    showToast("App 已删除");
  } catch (error) {
    showToast(error.message);
  }
}

async function handleVersionFormSubmit(event) {
  event.preventDefault();

  const currentProject = state.workspace.currentProject;
  const currentApp = state.appWorkspace.currentApp;
  if (!currentProject || !currentApp) {
    showToast("请先选择项目并创建或选择 App");
    return;
  }

  const versionName = elements.versionNameInput.value.trim();
  const buildNumber = elements.buildNumberInput.value.trim();
  const resourceVersion = elements.resourceVersionInput.value.trim();
  if (!versionName && !buildNumber && !resourceVersion) {
    showToast("版本号、构建号、资源版本至少填写一项");
    return;
  }

  const payload = {
    versionName,
    buildNumber,
    resourceVersion,
    description: elements.versionDescriptionInput.value.trim(),
    notes: elements.versionNotesInput.value.trim(),
    owner: elements.versionOwnerInput.value.trim(),
    channel: elements.versionChannelInput.value,
    status: elements.versionStatusInput.value,
    priority: elements.versionPriorityInput.value,
    plannedDate: normalizeLocalDueDate(elements.plannedDateInput.value),
    releaseDate: normalizeLocalDueDate(elements.releaseDateInput.value),
    publishedDate: normalizeLocalDueDate(elements.publishedDateInput.value),
  };

  const editingVersionId = state.ui.editingVersionId;

  try {
    if (state.appWorkspace.mode === "cloud") {
      if (editingVersionId) {
        await apiRequest(`/api/app-versions/${editingVersionId}`, {
          method: "PATCH",
          body: payload,
        });
      } else {
        await apiRequest(`/api/projects/${currentProject.id}/apps/${currentApp.id}/versions`, {
          method: "POST",
          body: payload,
        });
      }

      state.ui.editingVersionId = null;
      if (!editingVersionId) {
        state.ui.activeAppDetailPanel = null;
      }
      await loadCloudAppWorkspace({ projectId: currentProject.id, appId: currentApp.id });
      render();
      showToast(editingVersionId ? "版本已保存" : "版本已创建");
      return;
    }

    if (editingVersionId) {
      updateGuestWorkspace((workspace) => {
        const existingVersion = workspace.versions.find(
          (version) => version.id === editingVersionId
        );
        if (!existingVersion) {
          return;
        }

        const timestamp = new Date().toISOString();
        workspace.versions = workspace.versions.map((version) =>
          version.id === editingVersionId
            ? {
                ...version,
                ...payload,
                publishedDate: resolveGuestPublishedDateForStatus(
                  payload.status,
                  payload.publishedDate,
                  {
                    previousStatus: version.status,
                    previousPublishedDate: version.publishedDate,
                  }
                ),
                updatedAt: timestamp,
              }
            : version
        );
        touchGuestApp(workspace, existingVersion.appId, timestamp);
      });
    } else {
      const version = createGuestVersionRecord(currentApp.id, payload);
      updateGuestWorkspace((workspace) => {
        workspace.versions.unshift(version);
        touchGuestApp(workspace, currentApp.id, version.updatedAt);
      });
    }

    state.ui.editingVersionId = null;
    if (!editingVersionId) {
      state.ui.activeAppDetailPanel = null;
    }
    syncGuestAppView(currentApp.id, { projectId: currentProject.id });
    render();
    showToast(editingVersionId ? "版本已保存" : "版本已创建");
  } catch (error) {
    showToast(error.message);
  }
}

function handleVersionReset() {
  state.ui.editingVersionId = null;
  renderVersionEditor();
}

function handleVersionSearchInput(event) {
  state.ui.versionDetailSearch = event.target.value.trim();
  renderVersionListPanel();
}

function handleVersionFilterChange() {
  state.ui.versionDetailStatusFilter = elements.versionStatusFilterInput.value || "all";
  state.ui.versionDetailChannelFilter = elements.versionChannelFilterInput.value || "all";
  renderVersionListPanel();
}

function handleVersionFormStatusChange(event) {
  syncPublishedDateField(event.target.value);
}

function handleSelectVisibleVersions() {
  const visibleVersionIds = getFilteredAppVersions(
    sortVersionsForDisplay(state.appWorkspace.versions)
  ).map((version) => version.id);

  if (!visibleVersionIds.length) {
    showToast("当前没有可选择的版本");
    return;
  }

  const selectedIds = new Set(state.ui.selectedVersionIds);
  const areAllVisibleSelected = visibleVersionIds.every((versionId) => selectedIds.has(versionId));

  if (areAllVisibleSelected) {
    state.ui.selectedVersionIds = state.ui.selectedVersionIds.filter(
      (versionId) => !visibleVersionIds.includes(versionId)
    );
  } else {
    state.ui.selectedVersionIds = [
      ...new Set([...state.ui.selectedVersionIds, ...visibleVersionIds]),
    ];
  }

  renderVersionListPanel();
}

async function handleApplyBulkVersionStatus() {
  const currentProject = state.workspace.currentProject;
  const currentApp = state.appWorkspace.currentApp;
  const versionIds = state.ui.selectedVersionIds.filter((versionId) =>
    state.appWorkspace.versions.some((version) => version.id === versionId)
  );
  const status = elements.bulkVersionStatusInput.value;

  if (!currentProject || !currentApp) {
    showToast("请先选择 App");
    return;
  }

  if (!versionIds.length) {
    showToast("请先勾选版本");
    return;
  }

  try {
    if (state.appWorkspace.mode === "cloud") {
      await apiRequest(`/api/projects/${currentProject.id}/apps/${currentApp.id}/versions`, {
        method: "PATCH",
        body: {
          versionIds,
          status,
        },
      });
      await loadCloudAppWorkspace({ projectId: currentProject.id, appId: currentApp.id });
    } else {
      updateGuestWorkspace((workspace) => {
        const timestamp = new Date().toISOString();
        workspace.versions = workspace.versions.map((version) =>
          versionIds.includes(version.id)
            ? {
                ...version,
                status,
                publishedDate: resolveGuestPublishedDateForStatus(
                  status,
                  version.publishedDate,
                  {
                    previousStatus: version.status,
                    previousPublishedDate: version.publishedDate,
                  }
                ),
                updatedAt: timestamp,
              }
            : version
        );
        touchGuestApp(workspace, currentApp.id, timestamp);
      });
      syncGuestAppView(currentApp.id, { projectId: currentProject.id });
    }

    state.ui.selectedVersionIds = [];
    render();
    showToast(`已批量更新 ${versionIds.length} 个版本`);
  } catch (error) {
    showToast(error.message);
  }
}

async function handleVersionListClick(event) {
  const collapseButton = event.target.closest("[data-version-collapse-id]");
  if (collapseButton) {
    toggleExpandedId("expandedVersionRecordIds", collapseButton.dataset.versionCollapseId);
    renderVersionListPanel();
    return;
  }

  const actionButton = event.target.closest("[data-version-action]");
  if (!actionButton) {
    return;
  }

  const versionId = actionButton.dataset.versionId;
  if (!versionId) {
    return;
  }

  if (actionButton.dataset.versionAction === "edit") {
    state.ui.editingVersionId = versionId;
    state.ui.activeAppDetailPanel = "version";
    render();
    window.requestAnimationFrame(() => {
      if (
        typeof elements.versionNameInput.focus === "function" &&
        !elements.versionNameInput.disabled
      ) {
        elements.versionNameInput.focus();
      }
    });
    return;
  }

  const version = state.appWorkspace.versions.find((item) => item.id === versionId);
  if (!version) {
    showToast("版本不存在");
    return;
  }

  if (actionButton.dataset.versionAction === "copy") {
    try {
      await writeTextToClipboard(buildVersionSummaryText(version));
      showToast("版本信息已复制");
    } catch (error) {
      showToast(error.message);
    }
    return;
  }

  if (actionButton.dataset.versionAction !== "delete") {
    return;
  }

  if (!window.confirm(`确认删除版本“${buildVersionDisplayName(version)}”吗？`)) {
    return;
  }

  try {
    if (state.appWorkspace.mode === "cloud") {
      await apiRequest(`/api/app-versions/${versionId}`, {
        method: "DELETE",
      });
      await loadCloudAppWorkspace({
        projectId: state.workspace.currentProjectId,
        appId: state.appWorkspace.currentAppId,
      });
    } else {
      updateGuestWorkspace((workspace) => {
        workspace.versions = workspace.versions.filter((item) => item.id !== versionId);
        workspace.kiosks = workspace.kiosks.map((kiosk) =>
          kiosk.activeVersionId === versionId
            ? {
                ...kiosk,
                activeVersionId: "",
              }
            : kiosk
        );
        touchGuestApp(workspace, version.appId, new Date().toISOString());
      });
      syncGuestAppView(state.appWorkspace.currentAppId, {
        projectId: state.workspace.currentProjectId,
      });
    }

    render();
    showToast("版本已删除");
  } catch (error) {
    showToast(error.message);
  }
}

async function handleVersionListChange(event) {
  const selectionToggle = event.target.closest("[data-version-select-id]");
  if (selectionToggle) {
    const versionId = selectionToggle.dataset.versionSelectId;
    if (!versionId) {
      return;
    }

    if (selectionToggle.checked) {
      state.ui.selectedVersionIds = [...new Set([...state.ui.selectedVersionIds, versionId])];
    } else {
      state.ui.selectedVersionIds = state.ui.selectedVersionIds.filter(
        (item) => item !== versionId
      );
    }

    renderVersionListPanel();
    return;
  }

  const statusSelect = event.target.closest("[data-version-status-id]");
  if (!statusSelect) {
    return;
  }

  const versionId = statusSelect.dataset.versionStatusId;
  const nextStatus = statusSelect.value;

  if (!versionId || !VERSION_STATUS_META[nextStatus]) {
    showToast("版本状态无效");
    return;
  }

  const version = state.appWorkspace.versions.find((item) => item.id === versionId);
  if (!version) {
    showToast("版本不存在");
    return;
  }

  try {
    if (state.appWorkspace.mode === "cloud") {
      await apiRequest(`/api/app-versions/${versionId}`, {
        method: "PATCH",
        body: {
          status: nextStatus,
        },
      });
      await loadCloudAppWorkspace({
        projectId: state.workspace.currentProjectId,
        appId: state.appWorkspace.currentAppId,
      });
    } else {
      updateGuestWorkspace((workspace) => {
        const timestamp = new Date().toISOString();
        workspace.versions = workspace.versions.map((item) =>
          item.id === versionId
            ? {
                ...item,
                status: nextStatus,
                publishedDate: resolveGuestPublishedDateForStatus(
                  nextStatus,
                  item.publishedDate,
                  {
                    previousStatus: item.status,
                    previousPublishedDate: item.publishedDate,
                  }
                ),
                updatedAt: timestamp,
              }
            : item
        );
        touchGuestApp(workspace, version.appId, timestamp);
      });
      syncGuestAppView(state.appWorkspace.currentAppId, {
        projectId: state.workspace.currentProjectId,
      });
    }

    render();
    showToast("版本状态已更新");
  } catch (error) {
    showToast(error.message);
  }
}

function handleAuthModeChange(event) {
  if (state.auth.loading || state.auth.submitting || state.auth.user) {
    return;
  }

  state.auth.mode = event.currentTarget.dataset.authMode || "login";
  renderAuth();
}

function handleThemeModeChange(event) {
  const nextThemeMode = normalizeThemeMode(event.currentTarget.dataset.themeMode);
  if (nextThemeMode === state.ui.themeMode) {
    return;
  }

  state.ui.themeMode = nextThemeMode;
  persistThemeMode();
  renderThemeMode();
  showToast(`已切换到${THEME_META[nextThemeMode].label}`);
}

async function handleAuthSubmit(event) {
  event.preventDefault();

  if (state.auth.loading || state.auth.submitting || state.auth.user) {
    return;
  }

  const username = elements.authUsernameInput.value.trim();
  const password = elements.authPasswordInput.value;

  if (!username || !password) {
    showToast("请输入用户名和密码");
    return;
  }

  state.auth.submitting = true;
  renderAuth();

  try {
    const endpoint =
      state.auth.mode === "register" ? "/api/auth/register" : "/api/auth/login";
    const response = await apiRequest(endpoint, {
      method: "POST",
      body: {
        username,
        password,
      },
    });

    state.auth.user = response.user ?? null;
    state.auth.session = response.session ?? null;
    elements.authPasswordInput.value = "";

    await loadWorkspaceForCurrentMode();
    render();
    showToast(state.auth.mode === "register" ? "账号已创建" : "登录成功");
  } catch (error) {
    showToast(error.message);
  } finally {
    state.auth.submitting = false;
    renderAuth();
  }
}

async function handleRefreshSession() {
  if (state.auth.loading || state.auth.submitting) {
    return;
  }

  await restoreSession({ notify: true });
  await loadWorkspaceForCurrentMode({
    projectId: state.workspace.currentProjectId,
    appId: state.appWorkspace.currentAppId,
  });
  render();
}

async function handleLogout() {
  if (!state.auth.user || state.auth.loading || state.auth.submitting) {
    return;
  }

  state.auth.submitting = true;
  renderAuth();

  try {
    await apiRequest("/api/auth/logout", {
      method: "POST",
    });

    clearAuthState();
    elements.authPasswordInput.value = "";
    await loadWorkspaceForCurrentMode();
    render();
    showToast("已退出登录");
  } catch (error) {
    showToast(error.message);
  } finally {
    state.auth.submitting = false;
    renderAuth();
  }
}

async function restoreSession(options = {}) {
  const { notify = false } = options;

  state.auth.loading = true;
  renderAuth();

  try {
    const response = await apiRequest("/api/auth/session");
    state.auth.user = response.user ?? null;
    state.auth.session = response.session ?? null;

    if (notify) {
      showToast(state.auth.user ? "会话已刷新" : "当前没有可恢复的会话");
    }
  } catch (error) {
    clearAuthState();
    if (notify) {
      showToast(error.message);
    }
  } finally {
    state.auth.loading = false;
    renderAuth();
  }
}

async function loadWorkspaceForCurrentMode(options = {}) {
  if (state.auth.user) {
    await loadCloudWorkspace(options);
    await loadCloudAppWorkspace({
      projectId: options.projectId || state.workspace.currentProjectId,
      appId: options.appId || state.appWorkspace.currentAppId,
      silent: options.silent,
      preserveAppCreateMode: options.preserveAppCreateMode,
    });
    return;
  }

  syncGuestView(options.projectId, options);
  syncGuestAppView(options.appId, {
    ...options,
    projectId: options.projectId || state.guestWorkspace.currentProjectId,
  });
}

async function loadCloudWorkspace(options = {}) {
  const {
    projectId = null,
    silent = false,
    preserveProjectCreateMode = false,
  } = options;

  invalidateScheduleAllProjectsCache();

  try {
    const [projectsResponse, overviewResponse] = await Promise.all([
      apiRequest("/api/projects"),
      apiRequest("/api/projects/overview"),
    ]);
    const projects = Array.isArray(projectsResponse.projects)
      ? sortProjects(projectsResponse.projects)
      : [];
    const overview = normalizeOverviewPayload(overviewResponse);
    const selectedProject = resolveSelectedProject(
      projects,
      projectId || state.workspace.currentProjectId
    );

    if (!selectedProject) {
      state.workspace = {
        ...createEmptyWorkspaceView("cloud"),
        projects,
        overview,
      };
      syncEditorStateAfterWorkspaceSync({ preserveProjectCreateMode });
      return;
    }

    const board = await apiRequest(`/api/projects/${selectedProject.id}/board`);
    const boardProjects = Array.isArray(board.projects) ? sortProjects(board.projects) : projects;

    state.workspace = {
      mode: "cloud",
      projects: boardProjects,
      currentProjectId: board.project?.id || selectedProject.id,
      currentProject: board.project || selectedProject,
      tags: Array.isArray(board.tags) ? sortTags(board.tags) : [],
      kiosks: Array.isArray(board.kiosks) ? board.kiosks : [],
      tasks: Array.isArray(board.tasks) ? board.tasks : [],
      overview,
    };

    syncEditorStateAfterWorkspaceSync({ preserveProjectCreateMode });
  } catch (error) {
    if (error.status === 401) {
      clearAuthState();
      syncGuestView(null, { preserveProjectCreateMode });
    }

    if (!silent) {
      showToast(error.message);
    }
  }
}

function syncGuestView(preferredProjectId = null, options = {}) {
  const { preserveProjectCreateMode = false } = options;

  state.guestWorkspace = normalizeGuestWorkspace(state.guestWorkspace);

  const allProjects = sortProjects(state.guestWorkspace.projects);
  const projects = allProjects.filter((project) =>
    guestProjectHasMeaningfulData(state.guestWorkspace, project.id)
  );
  const currentProject =
    projects.find((project) => project.id === preferredProjectId) ||
    projects.find((project) => project.id === state.guestWorkspace.currentProjectId) ||
    projects.find((project) => !project.archived) ||
    projects[0] ||
    null;

  state.guestWorkspace.currentProjectId = currentProject
    ? currentProject.id
    : allProjects.find((project) => !project.archived)?.id || allProjects[0]?.id || null;

  state.workspace = {
    mode: "guest",
    projects,
    currentProjectId: currentProject ? currentProject.id : null,
    currentProject,
    tags: currentProject
      ? sortTags(state.guestWorkspace.tags.filter((tag) => tag.projectId === currentProject.id))
      : [],
    kiosks: currentProject
      ? sortKiosksForDisplay(
          state.guestWorkspace.kiosks.filter((kiosk) => kiosk.projectId === currentProject.id)
        )
      : [],
    tasks: currentProject
      ? state.guestWorkspace.tasks.filter((task) => task.projectId === currentProject.id)
      : [],
    overview: buildGuestWorkspaceOverview(state.guestWorkspace),
  };

  syncEditorStateAfterWorkspaceSync({ preserveProjectCreateMode });
  persistGuestWorkspace();
}

async function loadCloudAppWorkspace(options = {}) {
  const {
    projectId = null,
    appId = null,
    silent = false,
    preserveAppCreateMode = false,
  } = options;

  invalidateScheduleAllProjectsCache();

  try {
    const selectedProjectId = projectId || state.workspace.currentProjectId;
    if (!selectedProjectId) {
      state.appWorkspace = createEmptyAppWorkspaceView("cloud");
      syncAppEditorStateAfterWorkspaceSync({ preserveAppCreateMode });
      return;
    }

    const [appsResponse, overviewResponse, versionsResponse] = await Promise.all([
      apiRequest(`/api/projects/${selectedProjectId}/apps`),
      apiRequest(`/api/projects/${selectedProjectId}/apps/overview`),
      apiRequest(`/api/projects/${selectedProjectId}/apps/versions`),
    ]);
    const apps = Array.isArray(appsResponse.apps) ? sortProjects(appsResponse.apps) : [];
    const projectVersions = Array.isArray(versionsResponse.versions)
      ? versionsResponse.versions
      : [];
    const overview = normalizeAppOverviewPayload(overviewResponse);
    const selectedApp = resolveSelectedProject(apps, appId || state.appWorkspace.currentAppId);

    if (!selectedApp) {
      state.appWorkspace = {
        ...createEmptyAppWorkspaceView("cloud"),
        projectId: selectedProjectId,
        apps,
        projectVersions,
        overview,
      };
      syncAppEditorStateAfterWorkspaceSync({ preserveAppCreateMode });
      return;
    }

    const board = await apiRequest(`/api/projects/${selectedProjectId}/apps/${selectedApp.id}/board`);
    const boardApps = Array.isArray(board.apps) ? sortProjects(board.apps) : apps;

    state.appWorkspace = {
      mode: "cloud",
      projectId: selectedProjectId,
      apps: boardApps,
      projectVersions,
      currentAppId: board.app?.id || selectedApp.id,
      currentApp: board.app || selectedApp,
      versions: Array.isArray(board.versions) ? board.versions : [],
      overview,
    };

    syncAppEditorStateAfterWorkspaceSync({ preserveAppCreateMode });
  } catch (error) {
    if (error.status === 401) {
      clearAuthState();
      syncGuestAppView(null, { preserveAppCreateMode });
    }

    if (!silent) {
      showToast(error.message);
    }
  }
}

function syncGuestAppView(preferredAppId = null, options = {}) {
  const { preserveAppCreateMode = false, projectId = null } = options;

  state.guestWorkspace = normalizeGuestWorkspace(state.guestWorkspace);

  const selectedProjectId = projectId || state.guestWorkspace.currentProjectId || null;
  const apps = sortProjects(
    state.guestWorkspace.apps.filter((app) => app.projectId === selectedProjectId)
  );
  const currentApp =
    apps.find((app) => app.id === preferredAppId) ||
    apps.find((app) => app.id === state.guestWorkspace.currentAppId) ||
    apps.find((app) => !app.archived) ||
    apps[0] ||
    null;
  const appIds = new Set(apps.map((app) => app.id));
  const projectVersions = state.guestWorkspace.versions.filter((version) =>
    appIds.has(version.appId)
  );

  state.guestWorkspace.currentAppId = currentApp ? currentApp.id : null;

  state.appWorkspace = {
    mode: "guest",
    projectId: selectedProjectId,
    apps,
    projectVersions,
    currentAppId: currentApp ? currentApp.id : null,
    currentApp,
    versions: currentApp
      ? state.guestWorkspace.versions.filter((version) => version.appId === currentApp.id)
      : [],
    overview: buildGuestAppWorkspaceOverview(state.guestWorkspace, selectedProjectId),
  };

  syncAppEditorStateAfterWorkspaceSync({ preserveAppCreateMode });
  persistGuestWorkspace();
}

async function handleLoadDemo() {
  const payload = buildDemoWorkspacePayload();

  try {
    if (state.workspace.mode === "cloud") {
      const result = await importPayloadToCloud(payload);
      await loadWorkspaceForCurrentMode({
        projectId: result.importedProject?.id || null,
        appId: result.importedApp?.id || null,
      });
      render();
      showToast("示例数据已导入当前账号");
      return;
    }

    if (
      guestWorkspaceHasMeaningfulData(state.guestWorkspace) &&
      !window.confirm("载入示例会覆盖当前游客模式数据，是否继续？")
    ) {
      return;
    }

    state.guestWorkspace = importPayloadIntoGuestWorkspace(
      createEmptyGuestWorkspace(),
      payload
    );
    persistGuestWorkspace();
    syncGuestView();
    syncGuestAppView();
    render();
    showToast("示例工作区已载入");
  } catch (error) {
    showToast(error.message);
  }
}

async function handleExportJson() {
  const project = state.workspace.currentProject;
  if (!project || !canExportCurrentProject()) {
    showToast("当前没有可导出的项目");
    return;
  }

  try {
    const payload =
      state.workspace.mode === "cloud"
        ? await apiRequest(`/api/projects/${project.id}/export`)
        : buildGuestProjectExportPayload(state.guestWorkspace, project.id);

    downloadJson(
      payload,
      `${slugify(project.name || "task-atlas-project")}-${todayString()}.json`
    );
    showToast("JSON 已导出");
  } catch (error) {
    showToast(error.message);
  }
}

async function handleExportWorkspaceJson() {
  if (!state.workspace.projects.length && !state.appWorkspace.apps.length) {
    showToast("当前没有可导出的工作区内容");
    return;
  }

  try {
    const payload = await buildWorkspaceExportPayload();
    const filenameBase =
      state.workspace.mode === "cloud" && state.auth.user?.username
        ? `${state.auth.user.username}-workspace`
        : "task-atlas-workspace";

    downloadJson(payload, `${slugify(filenameBase)}-${todayString()}.json`);
    showToast("工作区 JSON 已导出");
  } catch (error) {
    showToast(error.message);
  }
}

async function handleCopyWorkspaceSummary() {
  if (!state.workspace.projects.length && !state.appWorkspace.apps.length) {
    showToast("当前没有可复制的工作区摘要");
    return;
  }

  try {
    await writeTextToClipboard(buildWorkspaceSummaryText());
    showToast("工作区摘要已复制");
  } catch (error) {
    showToast(error.message);
  }
}

async function handleRefreshWorkspace() {
  try {
    if (state.workspace.mode === "cloud") {
      await loadWorkspaceForCurrentMode({
        projectId: state.workspace.currentProjectId,
        appId: state.appWorkspace.currentAppId,
      });
    } else {
      syncGuestView(state.workspace.currentProjectId);
      syncGuestAppView(state.appWorkspace.currentAppId);
    }

    render();
    showToast("工作区已刷新");
  } catch (error) {
    showToast(error.message);
  }
}

async function handleOpenCurrentProjectDetails() {
  const currentProject = state.workspace.currentProject;
  if (!currentProject) {
    showToast("当前还没有可打开的项目");
    return;
  }

  await openProjectDetails(currentProject.id);
}

async function handleCopyCurrentProjectSummary() {
  const currentProject = state.workspace.currentProject;
  if (!currentProject) {
    showToast("请先选择一个项目");
    return;
  }

  try {
    await writeTextToClipboard(buildCurrentProjectSummaryText());
    showToast("当前项目摘要已复制");
  } catch (error) {
    showToast(error.message);
  }
}

async function handleCopyPendingTaskList() {
  const currentProject = state.workspace.currentProject;
  if (!currentProject) {
    showToast("请先选择一个项目");
    return;
  }

  try {
    await writeTextToClipboard(buildPendingTaskListText());
    showToast("待办清单已复制");
  } catch (error) {
    showToast(error.message);
  }
}

async function handleCopyCurrentProjectJson() {
  const currentProject = state.workspace.currentProject;
  if (!currentProject) {
    showToast("请先选择一个项目");
    return;
  }

  try {
    const payload = await buildProjectExportPayload(currentProject.id);
    await writeTextToClipboard(JSON.stringify(payload, null, 2));
    showToast("当前项目 JSON 已复制");
  } catch (error) {
    showToast(error.message);
  }
}

async function handleImportJsonFile(event) {
  const file = event.target.files?.[0];
  if (!file) {
    return;
  }

  try {
    const text = await file.text();
    const payload = JSON.parse(text);

    if (state.workspace.mode === "cloud") {
      const result = await importPayloadToCloud(payload);
      await loadWorkspaceForCurrentMode({
        projectId: result.importedProject?.id || null,
        appId: result.importedApp?.id || null,
      });
      render();
      showToast(buildImportResultMessage(result));
      return;
    }

    state.guestWorkspace = importPayloadIntoGuestWorkspace(state.guestWorkspace, payload);
    persistGuestWorkspace();
    syncGuestView();
    syncGuestAppView();
    render();
    showToast("JSON 已导入到游客工作区");
  } catch (error) {
    showToast(error.message || "导入失败，请检查 JSON 文件格式");
  } finally {
    elements.jsonImportInput.value = "";
  }
}

async function handleClearCompleted() {
  const currentProjectId = state.workspace.currentProjectId;
  const doneTasks = state.workspace.tasks.filter((task) => task.status === "done");

  if (!currentProjectId || !doneTasks.length) {
    showToast("当前项目没有已完成任务");
    return;
  }

  if (!window.confirm(`确认清空 ${doneTasks.length} 项已完成任务吗？`)) {
    return;
  }

  try {
    if (state.workspace.mode === "cloud") {
      await apiRequest(`/api/projects/${currentProjectId}/tasks/completed`, {
        method: "DELETE",
      });
      await loadCloudWorkspace({ projectId: currentProjectId });
    } else {
      updateGuestWorkspace((workspace) => {
        workspace.tasks = workspace.tasks.filter(
          (task) => task.projectId !== currentProjectId || task.status !== "done"
        );
        touchGuestProject(workspace, currentProjectId, new Date().toISOString());
      });
      syncGuestView(currentProjectId);
    }

    render();
    showToast("已清空已完成任务");
  } catch (error) {
    showToast(error.message);
  }
}

async function handleImportGuestToCloud() {
  if (!state.auth.user) {
    showToast("请先登录账号");
    return;
  }

  if (!guestWorkspaceHasMeaningfulData(state.guestWorkspace)) {
    showToast("当前没有可导入的游客数据");
    return;
  }

  if (state.guestWorkspace.importedUsers.includes(String(state.auth.user.id))) {
    showToast("当前游客数据已导入过这个账号");
    return;
  }

  try {
    const payload = buildGuestWorkspaceExportPayload(state.guestWorkspace);
    const result = await importPayloadToCloud(payload);

    markGuestWorkspaceImported(state.auth.user.id);
    await loadWorkspaceForCurrentMode({
      projectId: result.importedProject?.id || null,
      appId: result.importedApp?.id || null,
    });
    render();
    showToast(`已把游客数据导入账号，${buildImportResultMessage(result)}`);
  } catch (error) {
    showToast(error.message);
  }
}

function handleClearGuestData() {
  if (!guestWorkspaceHasMeaningfulData(state.guestWorkspace)) {
    showToast("当前没有可清空的游客数据");
    return;
  }

  if (!window.confirm("确认清空浏览器中的游客模式数据吗？")) {
    return;
  }

  state.guestWorkspace = createEmptyGuestWorkspace();
  persistGuestWorkspace();

  if (state.workspace.mode === "guest") {
    syncGuestView();
    syncGuestAppView();
  }

  render();
  showToast("游客数据已清空");
}

function render() {
  renderToolbox();
  renderActiveTool();
  renderProjectManagement();
  renderProjectEditDialog();
  renderOverview();
  renderDetails();
  renderSchedule();
  renderKioskDetails();
  renderAppOverview();
  renderAppDetails();
  renderAuth();
  renderDataTools();
  renderUtilities();
  renderSyncPanel();
  renderProjectCreateDialog();
}

function renderToolbox() {
  const currentProject = state.workspace.currentProject;
  const currentApp = state.appWorkspace.currentApp;
  const activeTool = TOOL_META[state.ui.activeTool] || TOOL_META.overview;
  const modeLabel = state.workspace.mode === "cloud" ? "云端账号模式" : "游客本地模式";
  const overviewTotals = state.workspace.overview?.totals || createEmptyOverview().totals;
  const appOverviewTotals =
    state.appWorkspace.overview?.totals || createEmptyAppOverview().totals;
  const pendingTaskCount = state.workspace.tasks.filter((task) => task.status !== "done").length;

  elements.toolboxButtons.forEach((button) => {
    button.classList.toggle("is-active", button.dataset.tool === state.ui.activeTool);
  });

  elements.toolboxActionButtons.forEach((button) => {
    button.disabled = isToolboxActionDisabled(button.dataset.toolAction, {
      currentProject,
      pendingTaskCount,
    });
  });

  elements.toolboxGroups.forEach((groupSection) => {
    const groupId = groupSection.dataset.group;
    const isCollapsed = Boolean(state.ui.collapsedGroups[groupId]);
    const list = groupSection.querySelector(".toolbox-group-list");
    const toggle = groupSection.querySelector("[data-group-toggle]");

    groupSection.classList.toggle("is-collapsed", isCollapsed);
    if (list) {
      list.hidden = isCollapsed;
    }
    if (toggle) {
      toggle.setAttribute("aria-expanded", String(!isCollapsed));
    }
  });

  elements.authStatePill.textContent = state.auth.user
    ? `账号：${state.auth.user.username}`
    : "游客模式";
  elements.workspaceModePill.textContent = modeLabel;

  if (state.ui.activeTool === "projects") {
    elements.toolboxProjectName.textContent = currentProject ? currentProject.name : "项目管理";
    elements.toolboxProjectMeta.textContent = currentProject
      ? `当前项目已作为任务管理、日程表、Kiosk 统计和 App 版本管理的统一容器。${activeTool.description}`
      : activeTool.description;
    return;
  }

  if (state.ui.activeTool === "overview") {
    elements.toolboxProjectName.textContent = "任务总览";
    elements.toolboxProjectMeta.textContent = `当前共有 ${overviewTotals.projectCount} 个项目、${overviewTotals.taskCount} 项任务。${activeTool.description}`;
    return;
  }

  if (state.ui.activeTool === "details") {
    elements.toolboxProjectName.textContent = currentProject ? currentProject.name : "任务详情";
    elements.toolboxProjectMeta.textContent = currentProject
      ? `当前项目共有 ${state.workspace.tasks.length} 项任务，创建于 ${formatDateTime(
          currentProject.createdAt
        )}。${activeTool.description}`
      : activeTool.description;
    return;
  }

  if (state.ui.activeTool === "schedule") {
    elements.toolboxProjectName.textContent = currentProject ? currentProject.name : "日程表";
    elements.toolboxProjectMeta.textContent = currentProject
      ? `当前项目共有 ${state.workspace.tasks.length} 项任务，可按日期查看开始、截止和完成安排。${activeTool.description}`
      : activeTool.description;
    return;
  }

  if (state.ui.activeTool === "kiosk-details") {
    elements.toolboxProjectName.textContent = currentProject ? currentProject.name : "Kiosk 统计";
    elements.toolboxProjectMeta.textContent = currentProject
      ? `当前项目共有 ${state.workspace.kiosks.length} 台 Kiosk，可统一维护设备、打印机和远控资料。${activeTool.description}`
      : activeTool.description;
    return;
  }

  if (state.ui.activeTool === "app-overview") {
    elements.toolboxProjectName.textContent = currentProject ? currentProject.name : "版本总览";
    elements.toolboxProjectMeta.textContent = currentProject
      ? `当前项目共有 ${appOverviewTotals.appCount} 个 App、${appOverviewTotals.versionCount} 个版本。${activeTool.description}`
      : activeTool.description;
    return;
  }

  if (state.ui.activeTool === "app-details") {
    elements.toolboxProjectName.textContent = currentApp
      ? currentApp.name
      : currentProject
        ? currentProject.name
        : "App 版本管理";
    elements.toolboxProjectMeta.textContent = currentApp
      ? `当前 App 归属项目“${currentProject?.name || "未选择"}”，共有 ${
          state.appWorkspace.versions.length
        } 个版本。${activeTool.description}`
      : activeTool.description;
    return;
  }

  if (state.ui.activeTool === "data") {
    elements.toolboxProjectName.textContent = currentProject ? currentProject.name : "数据工具";
    elements.toolboxProjectMeta.textContent = currentProject
      ? `当前数据操作默认作用于项目“${currentProject.name}”。${activeTool.description}`
      : activeTool.description;
    return;
  }

  if (state.ui.activeTool === "utilities") {
    elements.toolboxProjectName.textContent = currentProject ? currentProject.name : "常用工具";
    elements.toolboxProjectMeta.textContent = currentProject
      ? `当前可直接对项目“${currentProject.name}”执行快捷操作和摘要复制。${activeTool.description}`
      : activeTool.description;
    return;
  }

  elements.toolboxProjectName.textContent = state.auth.user
    ? state.auth.user.username
    : "账号与同步";
  elements.toolboxProjectMeta.textContent = activeTool.description;
}

function isToolboxActionDisabled(action, context) {
  const { currentProject, pendingTaskCount } = context;
  const workspaceAppCount = Number(state.workspace.overview?.totals?.appCount || 0);

  switch (action) {
    case "refresh-workspace":
      return state.auth.loading || state.auth.submitting;
    case "open-current-project":
      return !currentProject;
    case "copy-workspace-summary":
      return state.workspace.projects.length === 0 && workspaceAppCount === 0;
    case "copy-project-summary":
      return !currentProject;
    case "copy-pending-tasks":
      return !currentProject || pendingTaskCount === 0;
    case "copy-project-json":
      return !currentProject;
    case "export-workspace":
      return state.workspace.projects.length === 0 && workspaceAppCount === 0;
    default:
      return false;
  }
}

function renderActiveTool() {
  elements.workspaceViews.forEach((view) => {
    const isActive = view.dataset.view === state.ui.activeTool;
    view.hidden = !isActive;
    view.setAttribute("aria-hidden", String(!isActive));
  });
}

function renderOverview() {
  const overview = state.workspace.overview || createEmptyOverview();
  const totals = overview.totals || createEmptyOverview().totals;
  const completionRate = totals.taskCount
    ? Math.round((totals.doneCount / totals.taskCount) * 100)
    : 0;
  const projectSummaries = Array.isArray(overview.projects) ? overview.projects : [];

  state.ui.expandedOverviewProjectIds = state.ui.expandedOverviewProjectIds.filter((projectId) =>
    projectSummaries.some((project) => project.id === projectId)
  );

  elements.overviewProjectCount.textContent = String(totals.projectCount || 0);
  elements.overviewActiveProjectCount.textContent = String(totals.activeProjectCount || 0);
  elements.overviewTaskCount.textContent = String(totals.taskCount || 0);
  elements.overviewCompletionRate.textContent = `${completionRate}%`;
  elements.overviewTodoCount.textContent = String(totals.todoCount || 0);
  elements.overviewDoingCount.textContent = String(totals.doingCount || 0);
  elements.overviewReviewCount.textContent = String(totals.reviewCount || 0);
  elements.overviewDoneCount.textContent = String(totals.doneCount || 0);

  if (!projectSummaries.length) {
    elements.projectOverviewList.innerHTML = createEmptyStateMarkup(
      "还没有项目",
      "先到任务详情页创建项目，然后再回来查看整体分布。"
    );
    return;
  }

  elements.projectOverviewList.innerHTML = projectSummaries
    .map((project) => {
      const recentTasks = Array.isArray(project.recentTasks) ? project.recentTasks : [];
      const isExpanded = state.ui.expandedOverviewProjectIds.includes(project.id);

      return `
        <article class="project-overview-card">
          <div class="project-overview-head">
            <div class="project-overview-title">
              <div class="project-overview-title-row">
                <span
                  class="project-overview-dot"
                  style="--project-color: ${escapeHtml(project.color || "#c16b39")};"
                ></span>
                <h3>${escapeHtml(project.name || "未命名项目")}</h3>
              </div>
              <div class="meta-row">
                <span class="status-pill ${project.archived ? "status-review" : "status-doing"}">
                  ${project.archived ? "已归档" : "活跃"}
                </span>
                <span class="priority-pill priority-high">总任务 ${escapeHtml(project.taskCount)}</span>
                <span class="priority-pill priority-medium">创建于 ${escapeHtml(
                  formatDateTime(project.createdAt)
                )}</span>
              </div>
            </div>

            <div class="project-overview-actions">
              <button
                class="ghost-button mini-button"
                type="button"
                data-project-collapse-id="${escapeHtml(project.id)}"
                aria-expanded="${String(isExpanded)}"
              >
                ${isExpanded ? "收起" : "展开"}
              </button>
              <button
                class="ghost-button mini-button"
                type="button"
                data-open-project-id="${escapeHtml(project.id)}"
              >
                查看详情
              </button>
            </div>
          </div>

          <p class="project-overview-copy" ${isExpanded ? "" : "hidden"}>
            ${escapeHtml(project.description || "这个项目暂时还没有补充说明。")}
          </p>

          <div class="project-overview-metrics">
            <span class="status-pill status-todo">未开始 ${escapeHtml(project.todoCount)}</span>
            <span class="status-pill status-doing">进行中 ${escapeHtml(project.doingCount)}</span>
            <span class="status-pill status-review">待验收 ${escapeHtml(
              project.reviewCount
            )}</span>
            <span class="status-pill status-done">已完成 ${escapeHtml(project.doneCount)}</span>
          </div>

          <div class="recent-task-list" ${isExpanded ? "" : "hidden"}>
            ${
              recentTasks.length
                ? recentTasks
                    .map(
                      (task) => `
                        <div class="recent-task-item">
                          <div class="recent-task-head">
                            <strong>${escapeHtml(task.title || "未命名任务")}</strong>
                            <span class="status-pill status-${escapeHtml(task.status || "todo")}">
                              ${escapeHtml(STATUS_META[task.status]?.label || "未开始")}
                            </span>
                          </div>
                          <div class="recent-task-meta">
                            <span class="priority-pill priority-${escapeHtml(
                              task.priority || "medium"
                            )}">
                              优先级 ${escapeHtml(
                                PRIORITY_META[task.priority]?.label || "中"
                              )}
                            </span>
                            <span>更新于 ${escapeHtml(formatDateTime(task.updatedAt))}</span>
                          </div>
                        </div>
                      `
                    )
                    .join("")
                : `<div class="empty-inline">该项目还没有任务，点击详情后可直接创建。</div>`
            }
          </div>
        </article>
      `;
    })
    .join("");
}

function renderProjectManagement() {
  const projects = state.workspace.projects;
  const currentProject = state.workspace.currentProject;
  const overviewProjects = Array.isArray(state.workspace.overview?.projects)
    ? state.workspace.overview.projects
    : [];
  const projectSummaryById = new Map(overviewProjects.map((project) => [project.id, project]));

  elements.detailProjectCountBadge.textContent = `${projects.length} 个项目`;

  if (!projects.length) {
    elements.projectManagerList.innerHTML = createEmptyStateMarkup(
      "还没有项目",
      "点击顶部“新建项目”，先创建一个任务、Kiosk 和 App 的统一容器。"
    );
  } else {
    elements.projectManagerList.innerHTML = projects
      .map((project) => {
        const summary = projectSummaryById.get(project.id) || {};
        const isCurrent = currentProject?.id === project.id;

        return `
          <div class="manager-item">
            <div>
              <div class="manager-main">
                <span
                  class="manager-swatch"
                  style="background:${escapeHtml(project.color || "#c16b39")};"
                ></span>
                <strong>${escapeHtml(project.name || "未命名项目")}</strong>
              </div>
              <div class="meta-row">
                <span class="status-pill ${project.archived ? "status-review" : "status-doing"}">
                  ${project.archived ? "已归档" : "活跃"}
                </span>
                <span class="priority-pill priority-high">任务 ${escapeHtml(
                  String(summary.taskCount || 0)
                )}</span>
                <span class="priority-pill priority-medium">App ${escapeHtml(
                  String(summary.appCount || 0)
                )}</span>
                <span class="priority-pill priority-low">版本 ${escapeHtml(
                  String(summary.versionCount || 0)
                )}</span>
                <span class="priority-pill priority-low">Kiosk ${escapeHtml(
                  String(summary.kioskCount || 0)
                )}</span>
              </div>
            </div>

            <div class="meta-row">
              ${
                isCurrent
                  ? `<span class="status-pill status-doing">当前项目</span>`
                  : ""
              }
              <button
                class="${isCurrent ? "primary-button" : "ghost-button"} mini-button"
                type="button"
                data-project-action="switch"
                data-project-id="${escapeHtml(project.id)}"
                ${isCurrent ? "disabled" : ""}
              >
                ${isCurrent ? "已切换" : "切换为当前项目"}
              </button>
              <button
                class="ghost-button mini-button"
                type="button"
                data-project-action="edit"
                data-project-id="${escapeHtml(project.id)}"
              >
                编辑项目
              </button>
              <button
                class="danger-button mini-button"
                type="button"
                data-project-action="delete"
                data-project-id="${escapeHtml(project.id)}"
              >
                删除项目
              </button>
            </div>
          </div>
        `;
      })
      .join("");
  }
}

function renderKioskDetails() {
  const currentProject = state.workspace.currentProject;

  elements.kioskProjectSelect.innerHTML = buildProjectOptions(state.workspace.projects, "暂无项目");
  elements.kioskProjectSelect.value = currentProject?.id || "";
  elements.kioskProjectSelect.disabled = !state.workspace.projects.length;
  elements.projectKioskNewButton.disabled = !currentProject;

  renderKioskEditor();
  renderKioskListPanel();
  renderKioskDetailPanels();
}

function renderKioskEditor() {
  const currentProject = state.workspace.currentProject;
  const kiosks = sortKiosksForDisplay(state.workspace.kiosks || []);
  const editingKiosk = kiosks.find((kiosk) => kiosk.id === state.ui.editingKioskId) || null;
  const kioskPlatformState = resolvePresetOrCustomValue(
    editingKiosk?.kioskPlatform,
    KIOSK_PLATFORM_OPTIONS
  );
  const remotePlatformState = resolvePresetOrCustomValue(
    editingKiosk?.remotePlatform,
    KIOSK_REMOTE_PLATFORM_OPTIONS
  );

  if (state.ui.editingKioskId && !editingKiosk) {
    state.ui.editingKioskId = null;
  }

  elements.kioskEditorModeBadge.textContent = editingKiosk ? "编辑 Kiosk" : "新 Kiosk";
  elements.kioskProjectHint.textContent = currentProject
    ? `当前项目：${currentProject.name}。这里可以维护所属地区、位置、小票机连接方式、平台和远控信息。`
    : "请先通过“项目管理”创建或选择项目，再在这里录入 Kiosk。";
  elements.kioskIdInput.value = editingKiosk?.id || "";
  elements.kioskRegionInput.value = editingKiosk?.region || "";
  elements.kioskLocationInput.value = editingKiosk?.location || "";
  elements.kioskPrinterConnectionInput.value = editingKiosk?.printerConnection || "usb";
  elements.kioskPrinterModelInput.value = editingKiosk?.printerModel || "";
  elements.kioskPrinterNotesInput.value = editingKiosk?.printerNotes || "";
  elements.kioskPlatformSelect.value = kioskPlatformState.selectedValue;
  elements.kioskPlatformInput.value = kioskPlatformState.customValue;
  elements.kioskRemotePlatformSelect.value = remotePlatformState.selectedValue;
  elements.kioskRemotePlatformInput.value = remotePlatformState.customValue;
  elements.kioskRemoteCodeInput.value = editingKiosk?.remoteCode || "";
  renderKioskUsageSelectors(editingKiosk);
  elements.kioskNotesInput.value = editingKiosk?.notes || "";
  elements.kioskSubmitButton.textContent = editingKiosk ? "保存 Kiosk" : "创建 Kiosk";
  elements.kioskResetButton.textContent = editingKiosk ? "取消编辑" : "清空表单";
  setFormDisabled(elements.kioskForm, !currentProject);
  toggleSelectCustomInput(elements.kioskPlatformSelect, elements.kioskPlatformInput);
  toggleSelectCustomInput(elements.kioskRemotePlatformSelect, elements.kioskRemotePlatformInput);
  updateKioskActiveVersionSelectState();
}

function renderKioskListPanel() {
  const currentProject = state.workspace.currentProject;
  const kiosks = sortKiosksForDisplay(state.workspace.kiosks || []);
  const availableRegions = getAvailableKioskRegions(kiosks);

  if (
    state.ui.kioskRegionFilter !== "all" &&
    !availableRegions.includes(state.ui.kioskRegionFilter)
  ) {
    state.ui.kioskRegionFilter = "all";
  }

  const filteredKiosks = kiosks.filter(
    (kiosk) =>
      state.ui.kioskRegionFilter === "all" || kiosk.region === state.ui.kioskRegionFilter
  );
  const summary = summarizeKiosks(filteredKiosks);
  const isRegionFilterActive = state.ui.kioskRegionFilter !== "all";

  elements.kioskRegionFilterInput.innerHTML = buildKioskRegionFilterOptions(availableRegions);
  elements.kioskRegionFilterInput.value = state.ui.kioskRegionFilter;
  elements.kioskRegionFilterInput.disabled = !currentProject || availableRegions.length === 0;

  elements.projectKioskCountBadge.textContent = currentProject
    ? isRegionFilterActive
      ? `${filteredKiosks.length} / ${kiosks.length} 台 Kiosk`
      : `${kiosks.length} 台 Kiosk`
    : "0 台 Kiosk";
  elements.projectKioskMeta.textContent = currentProject
    ? isRegionFilterActive
      ? `当前项目“${currentProject.name}”下共有 ${kiosks.length} 台 Kiosk，当前按地区“${state.ui.kioskRegionFilter}”显示 ${filteredKiosks.length} 台。`
      : `当前项目“${currentProject.name}”下共有 ${kiosks.length} 台 Kiosk，可统一维护打印机连接、平台和远控信息。`
    : "这里会列出当前项目的全部 Kiosk、打印机信息和远控信息。";
  elements.projectKioskStats.innerHTML = renderKioskStats(summary, currentProject);

  if (!currentProject) {
    elements.projectKioskList.innerHTML = createEmptyStateMarkup(
      "还没有项目",
      "先通过“项目管理”创建项目，然后再在这里查看和维护 Kiosk。"
    );
    return;
  }

  if (!kiosks.length) {
    elements.projectKioskList.innerHTML = createEmptyStateMarkup(
      "当前项目还没有 Kiosk",
      "先填写地区、位置和设备信息，为这个项目创建第一台 Kiosk。"
    );
    return;
  }

  if (!filteredKiosks.length) {
    elements.projectKioskList.innerHTML = createEmptyStateMarkup(
      "当前地区下没有 Kiosk",
      "试试切换到其他地区分类，或者把筛选改回“全部地区”。"
    );
    return;
  }

  elements.projectKioskList.innerHTML = filteredKiosks
    .map((kiosk) => renderKioskRecord(kiosk))
    .join("");
}

function renderKioskDetailPanels() {
  const activePanel =
    state.ui.activeTool === "kiosk-details" ? state.ui.activeKioskDetailPanel : null;
  const isEditorPanelOpen = activePanel === "editor";

  syncOverlayBodyState(Boolean(activePanel));
  elements.kioskDetailPanelBackdrop.hidden = !activePanel;
  elements.kioskDetailPanel.hidden = !isEditorPanelOpen;
  elements.kioskDetailPanel.setAttribute("aria-hidden", String(!isEditorPanelOpen));
  elements.projectKioskNewButton.setAttribute("aria-expanded", String(isEditorPanelOpen));
}

function renderKioskStats(summary, currentProject) {
  if (!currentProject) {
    return "";
  }

  return `
    <span class="priority-pill priority-high">地区 ${escapeHtml(String(summary.regionCount))}</span>
    <span class="priority-pill priority-medium">USB ${escapeHtml(String(summary.usbCount))}</span>
    <span class="priority-pill priority-medium">蓝牙 ${escapeHtml(
      String(summary.bluetoothCount)
    )}</span>
    <span class="priority-pill priority-medium">WiFi ${escapeHtml(String(summary.wifiCount))}</span>
  `;
}

function getAvailableKioskRegions(kiosks) {
  return [...new Set(kiosks.map((kiosk) => String(kiosk.region || "").trim()).filter(Boolean))].sort(
    (left, right) => left.localeCompare(right, "zh-CN")
  );
}

function buildKioskRegionFilterOptions(regions) {
  return [
    `<option value="all">全部地区</option>`,
    ...regions.map(
      (region) => `<option value="${escapeHtml(region)}">${escapeHtml(region)}</option>`
    ),
  ].join("");
}

function renderKioskUsageSelectors(kiosk = null) {
  const apps = getCurrentProjectApps();
  const activeAppId =
    kiosk?.activeAppId && apps.some((app) => app.id === kiosk.activeAppId)
      ? kiosk.activeAppId
      : "";

  elements.kioskActiveAppSelect.innerHTML = buildKioskActiveAppOptions(apps);
  elements.kioskActiveAppSelect.value = activeAppId;
  renderKioskActiveVersionOptions(
    activeAppId,
    activeAppId ? kiosk?.activeVersionId || "" : "",
    kiosk
  );
}

function renderKioskActiveVersionOptions(activeAppId, selectedVersionId = "", kiosk = null) {
  const versions = getKioskVersionsForApp(activeAppId);
  const hasSelectedVersion = versions.some((version) => version.id === selectedVersionId);
  const options = [
    `<option value="">${activeAppId ? "未关联版本" : "先选择 App"}</option>`,
    ...versions.map(
      (version) =>
        `<option value="${escapeHtml(version.id)}">${escapeHtml(
          buildKioskVersionOptionLabel(version)
        )}</option>`
    ),
  ];

  if (selectedVersionId && !hasSelectedVersion) {
    options.push(
      `<option value="${escapeHtml(selectedVersionId)}">${escapeHtml(
        buildKioskVersionFallbackLabel(kiosk)
      )}</option>`
    );
  }

  elements.kioskActiveVersionSelect.innerHTML = options.join("");
  elements.kioskActiveVersionSelect.value =
    hasSelectedVersion || selectedVersionId ? selectedVersionId : "";
  updateKioskActiveVersionSelectState();
}

function updateKioskActiveVersionSelectState() {
  elements.kioskActiveVersionSelect.disabled =
    elements.kioskActiveAppSelect.disabled ||
    !elements.kioskActiveAppSelect.value ||
    elements.kioskActiveVersionSelect.options.length <= 1;
}

function buildKioskActiveAppOptions(apps) {
  return [
    `<option value="">${apps.length ? "未关联 App" : "当前项目暂无 App"}</option>`,
    ...apps.map(
      (app) =>
        `<option value="${escapeHtml(app.id)}">${escapeHtml(
          app.name || "未命名 App"
        )}${app.archived ? " (已归档)" : ""}</option>`
    ),
  ].join("");
}

function getCurrentProjectApps() {
  const projectId = state.workspace.currentProjectId;
  if (!projectId) {
    return [];
  }

  if (state.appWorkspace.projectId === projectId) {
    return state.appWorkspace.apps || [];
  }

  if (state.workspace.mode === "guest") {
    return sortProjects(state.guestWorkspace.apps.filter((app) => app.projectId === projectId));
  }

  return [];
}

function getCurrentProjectVersions() {
  const projectId = state.workspace.currentProjectId;
  if (!projectId) {
    return [];
  }

  if (state.appWorkspace.projectId === projectId) {
    return state.appWorkspace.projectVersions || state.appWorkspace.versions || [];
  }

  if (state.workspace.mode === "guest") {
    const appIds = new Set(
      state.guestWorkspace.apps
        .filter((app) => app.projectId === projectId)
        .map((app) => app.id)
    );
    return state.guestWorkspace.versions.filter((version) => appIds.has(version.appId));
  }

  return [];
}

function getKioskVersionsForApp(activeAppId) {
  if (!activeAppId) {
    return [];
  }

  return sortVersionsForDisplay(
    getCurrentProjectVersions().filter((version) => version.appId === activeAppId)
  );
}

function buildKioskVersionOptionLabel(version) {
  return [
    version.versionName || "",
    version.buildNumber ? `构建 ${version.buildNumber}` : "",
    version.resourceVersion ? `资源 ${version.resourceVersion}` : "",
  ]
    .filter(Boolean)
    .join(" / ") || "未命名版本";
}

function buildKioskVersionFallbackLabel(kiosk) {
  const label =
    [
      kiosk?.activeVersionName || "",
      kiosk?.activeBuildNumber ? `构建 ${kiosk.activeBuildNumber}` : "",
      kiosk?.activeResourceVersion ? `资源 ${kiosk.activeResourceVersion}` : "",
    ]
      .filter(Boolean)
      .join(" / ") || "已关联版本";

  return `${label}（未在当前项目版本列表中找到）`;
}

function resolveKioskUsageDisplay(kiosk) {
  const currentProject = state.workspace.currentProject;
  const apps = getCurrentProjectApps();
  const versions = getCurrentProjectVersions();
  const activeApp = apps.find((app) => app.id === kiosk.activeAppId) || null;
  const activeVersion =
    versions.find((version) => version.id === kiosk.activeVersionId) || null;

  return {
    projectName: currentProject?.name || "未选择项目",
    appName: activeApp?.name || kiosk.activeAppName || "",
    appVersion:
      activeVersion?.versionName ||
      activeVersion?.buildNumber ||
      kiosk.activeVersionName ||
      kiosk.activeBuildNumber ||
      "未关联版本",
    resourceVersion:
      activeVersion?.resourceVersion || kiosk.activeResourceVersion || "未填写",
  };
}

function resolvePresetOrCustomValue(value, presetOptions) {
  const normalizedValue = String(value || "").trim();
  if (!normalizedValue) {
    return {
      selectedValue: "",
      customValue: "",
    };
  }

  const matchedOption = presetOptions.find(
    (option) => option.toLowerCase() === normalizedValue.toLowerCase()
  );
  if (matchedOption) {
    return {
      selectedValue: matchedOption,
      customValue: "",
    };
  }

  return {
    selectedValue: "other",
    customValue: normalizedValue,
  };
}

function toggleSelectCustomInput(select, input) {
  const shouldShowCustomInput = select.value === "other";
  input.hidden = !shouldShowCustomInput;
  input.disabled = select.disabled || !shouldShowCustomInput;
}

function getSelectOrCustomInputValue(select, input) {
  if (select.value === "other") {
    return input.value.trim();
  }

  return select.value.trim();
}

function renderKioskRecord(kiosk) {
  const title = [kiosk.region, kiosk.location].filter(Boolean).join(" / ") || "未命名 Kiosk";
  const connectionLabel =
    KIOSK_PRINTER_CONNECTION_META[kiosk.printerConnection]?.label || "USB";
  const usage = resolveKioskUsageDisplay(kiosk);
  const usageSegments = [
    `正在使用的项目：${usage.projectName}`,
    usage.appName ? `App：${usage.appName}` : "",
    `App 版本：${usage.appVersion}`,
    `资源版本：${usage.resourceVersion}`,
    `更新时间：${formatDateTime(kiosk.updatedAt)}`,
  ].filter(Boolean);
  const summarySegments = [
    kiosk.printerModel ? `小票机：${kiosk.printerModel}` : "",
    kiosk.kioskPlatform ? `Kiosk 平台：${kiosk.kioskPlatform}` : "",
    kiosk.remotePlatform ? `远控平台：${kiosk.remotePlatform}` : "",
    kiosk.remoteCode ? `远控码：${kiosk.remoteCode}` : "",
  ].filter(Boolean);
  const detailSegments = [
    kiosk.printerNotes ? `小票机备注：${kiosk.printerNotes}` : "",
    kiosk.notes ? `备注：${kiosk.notes}` : "",
  ].filter(Boolean);

  return `
    <div class="manager-item">
      <div>
        <div class="manager-main">
          <span class="manager-swatch" style="background:var(--accent);"></span>
          <strong>${escapeHtml(title)}</strong>
        </div>
        <div class="meta-row">
          <span class="status-pill status-doing">${escapeHtml(connectionLabel)}</span>
          ${
            kiosk.printerModel
              ? `<span class="priority-pill priority-medium">${escapeHtml(kiosk.printerModel)}</span>`
              : ""
          }
          ${
            kiosk.kioskPlatform
              ? `<span class="priority-pill priority-low">平台 ${escapeHtml(
                  kiosk.kioskPlatform
                )}</span>`
              : ""
          }
          ${
            kiosk.remotePlatform
              ? `<span class="priority-pill priority-low">远控 ${escapeHtml(
                  kiosk.remotePlatform
                )}</span>`
              : ""
          }
        </div>
        ${
          summarySegments.length
            ? `<p class="project-overview-copy">${escapeHtml(summarySegments.join(" | "))}</p>`
            : ""
        }
        <p class="project-overview-copy">${escapeHtml(usageSegments.join(" | "))}</p>
        ${
          detailSegments.length
            ? `<p class="project-overview-copy">${escapeHtml(detailSegments.join(" | "))}</p>`
            : ""
        }
      </div>

      <div class="meta-row">
        <button
          class="ghost-button mini-button"
          type="button"
          data-kiosk-action="edit"
          data-kiosk-id="${escapeHtml(kiosk.id)}"
        >
          编辑
        </button>
        <button
          class="danger-button mini-button"
          type="button"
          data-kiosk-action="delete"
          data-kiosk-id="${escapeHtml(kiosk.id)}"
        >
          删除
        </button>
      </div>
    </div>
  `;
}

function renderProjectEditDialog() {
  const currentProject = state.workspace.currentProject;
  const isOpen = state.ui.projectEditDialogOpen && Boolean(currentProject);

  elements.projectEditDialogBackdrop.hidden = !isOpen;
  elements.projectEditDialog.hidden = !isOpen;
  elements.projectEditDialog.setAttribute("aria-hidden", String(!isOpen));
  elements.projectIdInput.value = currentProject?.id || "";
  elements.projectNameInput.value = currentProject?.name || "";
  elements.projectColorInput.value = currentProject?.color || "#c16b39";
  elements.projectDescriptionInput.value = currentProject?.description || "";
  elements.projectSubmitButton.textContent = "保存项目";
  elements.projectArchiveButton.textContent = currentProject?.archived ? "取消归档" : "归档项目";
  elements.projectArchiveButton.disabled = !currentProject;
  elements.projectDeleteButton.disabled = !currentProject;
  setFormDisabled(elements.projectForm, !currentProject);
  elements.projectFormCopy.textContent = currentProject
    ? `当前正在编辑项目“${currentProject.name}”，任务管理、日程表、Kiosk 统计和 App 版本管理都会直接使用这个项目。`
    : "当前没有可编辑的项目。";

  renderTagManager();
}

function renderDetails() {
  const currentProject = state.workspace.currentProject;

  elements.detailProjectSelect.innerHTML = buildProjectOptions(
    state.workspace.projects,
    "暂无项目"
  );
  elements.detailProjectSelect.value = currentProject?.id || "";
  elements.detailProjectSelect.disabled = !state.workspace.projects.length;
  elements.detailTaskPanelButton.disabled = !currentProject;
  renderTaskEditor();
  renderTaskFilterControls();
  renderTaskListPanel();
  renderDetailPanels();
}

function renderSchedule() {
  const scheduleProjectFilter = normalizeScheduleProjectFilter();
  const projectIdsWithPendingTasks = getScheduleProjectPendingTaskIds();

  state.ui.scheduleProjectFilter = scheduleProjectFilter;
  elements.scheduleProjectSelect.innerHTML = buildScheduleProjectOptions(
    state.workspace.projects,
    projectIdsWithPendingTasks
  );
  elements.scheduleProjectSelect.value = scheduleProjectFilter;
  elements.scheduleProjectSelect.disabled = !state.workspace.projects.length;
  renderTaskCalendarPanel();

  if (shouldLoadCloudScheduleAllProjectsForIndicators()) {
    void loadCloudScheduleAllProjects({ force: true });
  }
}

function normalizeScheduleProjectFilter() {
  const projects = state.workspace.projects;
  const selectedValue = state.ui.scheduleProjectFilter;
  const currentProjectId = state.workspace.currentProject?.id || "";

  if (!projects.length) {
    return "";
  }

  if (selectedValue === SCHEDULE_ALL_PROJECTS_VALUE) {
    return SCHEDULE_ALL_PROJECTS_VALUE;
  }

  if (projects.some((project) => project.id === selectedValue)) {
    return selectedValue;
  }

  return currentProjectId || projects[0]?.id || "";
}

function getScheduleCalendarData() {
  const filterValue = normalizeScheduleProjectFilter();
  const isAllProjects = filterValue === SCHEDULE_ALL_PROJECTS_VALUE;

  if (!filterValue) {
    return createEmptyScheduleCalendarData();
  }

  if (isAllProjects) {
    return getAllProjectsScheduleCalendarData();
  }

  return getProjectScheduleCalendarData(filterValue);
}

function createEmptyScheduleCalendarData(overrides = {}) {
  return {
    filterValue: "",
    isAllProjects: false,
    projects: [],
    tasks: [],
    tags: [],
    apps: [],
    versions: [],
    loading: false,
    error: "",
    needsLoad: false,
    ...overrides,
  };
}

function getAllProjectsScheduleCalendarData() {
  if (state.workspace.mode === "guest") {
    const projectIds = new Set(state.workspace.projects.map((project) => project.id));
    const apps = sortProjects(
      state.guestWorkspace.apps.filter((app) => projectIds.has(app.projectId))
    );
    const appIds = new Set(apps.map((app) => app.id));

    return createEmptyScheduleCalendarData({
      filterValue: SCHEDULE_ALL_PROJECTS_VALUE,
      isAllProjects: true,
      projects: state.workspace.projects,
      tasks: state.guestWorkspace.tasks.filter((task) => projectIds.has(task.projectId)),
      tags: sortTags(state.guestWorkspace.tags.filter((tag) => projectIds.has(tag.projectId))),
      apps,
      versions: state.guestWorkspace.versions.filter((version) => appIds.has(version.appId)),
    });
  }

  const projectIdsKey = getScheduleProjectIdsKey();
  const cached = state.scheduleAllProjects;

  if (cached.loading) {
    return createEmptyScheduleCalendarData({
      filterValue: SCHEDULE_ALL_PROJECTS_VALUE,
      isAllProjects: true,
      projects: state.workspace.projects,
      loading: true,
    });
  }

  if (cached.projectIdsKey === projectIdsKey) {
    return createEmptyScheduleCalendarData({
      filterValue: SCHEDULE_ALL_PROJECTS_VALUE,
      isAllProjects: true,
      projects: cached.projects,
      tasks: cached.tasks,
      tags: cached.tags,
      apps: cached.apps,
      versions: cached.versions,
      error: cached.error,
    });
  }

  return createEmptyScheduleCalendarData({
    filterValue: SCHEDULE_ALL_PROJECTS_VALUE,
    isAllProjects: true,
    projects: state.workspace.projects,
    loading: true,
    needsLoad: true,
  });
}

function getProjectScheduleCalendarData(projectId) {
  const project = state.workspace.projects.find((item) => item.id === projectId) || null;

  if (!project) {
    return createEmptyScheduleCalendarData();
  }

  if (state.workspace.mode === "guest" && projectId !== state.workspace.currentProjectId) {
    const apps = sortProjects(
      state.guestWorkspace.apps.filter((app) => app.projectId === projectId)
    );
    const appIds = new Set(apps.map((app) => app.id));

    return createEmptyScheduleCalendarData({
      filterValue: projectId,
      projects: [project],
      tasks: state.guestWorkspace.tasks.filter((task) => task.projectId === projectId),
      tags: sortTags(state.guestWorkspace.tags.filter((tag) => tag.projectId === projectId)),
      apps,
      versions: state.guestWorkspace.versions.filter((version) => appIds.has(version.appId)),
    });
  }

  return createEmptyScheduleCalendarData({
    filterValue: projectId,
    projects: [project],
    tasks: state.workspace.tasks,
    tags: state.workspace.tags,
    apps: getCurrentProjectApps(),
    versions: getCurrentProjectVersions(),
  });
}

async function loadCloudScheduleAllProjects(options = {}) {
  const { force = false } = options;

  if (
    state.workspace.mode !== "cloud" ||
    (!force && state.ui.scheduleProjectFilter !== SCHEDULE_ALL_PROJECTS_VALUE)
  ) {
    return;
  }

  const projects = state.workspace.projects;
  const projectIdsKey = getScheduleProjectIdsKey();

  if (!projects.length || state.scheduleAllProjects.loading) {
    return;
  }

  if (state.scheduleAllProjects.projectIdsKey === projectIdsKey && !state.scheduleAllProjects.error) {
    return;
  }

  state.scheduleAllProjects = {
    ...createEmptyScheduleAllProjectsView(),
    loading: true,
    projectIdsKey,
    projects,
  };
  renderSchedule();

  try {
    const bundles = await Promise.all(
      projects.map(async (project) => {
        const [board, appsResponse, versionsResponse] = await Promise.all([
          apiRequest(`/api/projects/${project.id}/board`),
          apiRequest(`/api/projects/${project.id}/apps`),
          apiRequest(`/api/projects/${project.id}/apps/versions`),
        ]);

        return {
          project,
          tasks: Array.isArray(board.tasks) ? board.tasks : [],
          tags: Array.isArray(board.tags) ? board.tags : [],
          apps: Array.isArray(appsResponse.apps) ? appsResponse.apps : [],
          versions: Array.isArray(versionsResponse.versions) ? versionsResponse.versions : [],
        };
      })
    );

    if (projectIdsKey !== getScheduleProjectIdsKey()) {
      state.scheduleAllProjects = createEmptyScheduleAllProjectsView();
      renderSchedule();
      return;
    }

    state.scheduleAllProjects = {
      loading: false,
      error: "",
      projectIdsKey,
      projects,
      tasks: bundles.flatMap((bundle) => bundle.tasks),
      tags: sortTags(bundles.flatMap((bundle) => bundle.tags)),
      apps: sortProjects(bundles.flatMap((bundle) => bundle.apps)),
      versions: bundles.flatMap((bundle) => bundle.versions),
    };
  } catch (error) {
    state.scheduleAllProjects = {
      ...createEmptyScheduleAllProjectsView(),
      loading: false,
      error: error.message,
      projectIdsKey,
      projects,
    };
    showToast(error.message);
  }

  renderSchedule();
}

function getScheduleProjectIdsKey() {
  return state.workspace.projects.map((project) => project.id).join("|");
}

function shouldLoadCloudScheduleAllProjectsForIndicators() {
  if (state.ui.activeTool !== "schedule" || state.workspace.mode !== "cloud") {
    return false;
  }

  if (!state.workspace.projects.length || state.scheduleAllProjects.loading) {
    return false;
  }

  return state.scheduleAllProjects.projectIdsKey !== getScheduleProjectIdsKey();
}

function getScheduleProjectPendingTaskIds() {
  const selectedDate = normalizeCalendarDateKey(state.ui.taskCalendarSelectedDate);
  const projectIds = new Set();

  getScheduleIndicatorTasks().forEach((task) => {
    if (isPendingTaskOnScheduleDate(task, selectedDate)) {
      projectIds.add(task.projectId);
    }
  });

  return projectIds;
}

function getScheduleIndicatorTasks() {
  const projectIds = new Set(state.workspace.projects.map((project) => project.id));

  if (!projectIds.size) {
    return [];
  }

  if (state.workspace.mode === "guest") {
    return state.guestWorkspace.tasks.filter((task) => projectIds.has(task.projectId));
  }

  if (
    state.scheduleAllProjects.projectIdsKey === getScheduleProjectIdsKey() &&
    !state.scheduleAllProjects.loading &&
    !state.scheduleAllProjects.error
  ) {
    return state.scheduleAllProjects.tasks;
  }

  return state.workspace.tasks;
}

function isPendingTaskOnScheduleDate(task, dateKey) {
  if (!task?.projectId || task.status === "done" || !isCalendarDateKey(dateKey)) {
    return false;
  }

  const range = getTaskCalendarRange(task);

  if (!range) {
    return false;
  }

  return dateKey >= range.startDateKey && dateKey <= range.endDateKey;
}

function invalidateScheduleAllProjectsCache() {
  state.scheduleAllProjects = createEmptyScheduleAllProjectsView();
}

function renderTagManager() {
  const currentProject = state.workspace.currentProject;
  const tags = state.workspace.tags;
  const editingTag = tags.find((tag) => tag.id === state.ui.editingTagId) || null;

  elements.tagManagerCopy.textContent = currentProject
    ? `当前项目“${currentProject.name}”共有 ${tags.length} 个标签，可用于任务分类、搜索和筛选。`
    : "请先选择项目，再为这个项目维护标签。";
  elements.tagIdInput.value = editingTag?.id || "";
  elements.tagNameInput.value = editingTag?.name || "";
  elements.tagColorInput.value = editingTag?.color || "#245a73";
  elements.tagSubmitButton.textContent = editingTag ? "保存标签" : "创建标签";
  elements.tagResetButton.textContent = editingTag ? "取消编辑" : "清空表单";
  setFormDisabled(elements.tagForm, !currentProject);

  if (!currentProject) {
    elements.detailTagList.innerHTML = createEmptyInlineMarkup("当前项目还不可用");
    return;
  }

  if (!tags.length) {
    elements.detailTagList.innerHTML = createEmptyInlineMarkup("还没有标签，先创建一个");
    return;
  }

  elements.detailTagList.innerHTML = tags
    .map(
      (tag) => `
        <div class="manager-item">
          <div class="manager-main">
            <span
              class="manager-swatch"
              style="background:${escapeHtml(tag.color || "#245a73")};"
            ></span>
            <strong>${escapeHtml(tag.name)}</strong>
          </div>

          <div class="meta-row">
            <button
              class="ghost-button mini-button"
              type="button"
              data-tag-action="edit"
              data-tag-id="${escapeHtml(tag.id)}"
            >
              编辑
            </button>
            <button
              class="danger-button mini-button"
              type="button"
              data-tag-action="delete"
              data-tag-id="${escapeHtml(tag.id)}"
            >
              删除
            </button>
          </div>
        </div>
      `
    )
    .join("");
}

function renderTaskEditor() {
  const currentProject = state.workspace.currentProject;
  const tasks = sortTasksForDisplay(state.workspace.tasks);
  const editingTask = tasks.find((task) => task.id === state.ui.editingTaskId) || null;
  const selectedTagIds = editingTask?.tagIds || [];

  elements.taskEditorModeBadge.textContent = editingTask ? "编辑任务" : "新任务";
  elements.taskProjectHint.textContent = currentProject
    ? `当前项目：${currentProject.name}。这里可以维护任务标题、状态、优先级、日期、备注、标签和子任务。`
    : "请先通过“项目管理”创建或选择项目，再在这里录入任务。";
  elements.taskIdInput.value = editingTask?.id || "";
  elements.titleInput.value = editingTask?.title || "";
  elements.descriptionInput.value = editingTask?.description || "";
  elements.notesInput.value = editingTask?.notes || "";
  elements.statusInput.value = editingTask?.status || "todo";
  elements.priorityInput.value = editingTask?.priority || "medium";
  elements.assigneeInput.value = editingTask?.assignee || "";
  elements.startDateInput.value = editingTask?.startDate || "";
  elements.dueDateInput.value = editingTask?.dueDate || "";
  elements.completedDateInput.value = editingTask?.completedDate || "";
  elements.subtasksInput.value = formatSubtasksForInput(editingTask?.subtasks || []);
  elements.taskSubmitButton.textContent = editingTask ? "保存任务" : "创建任务";
  elements.taskResetButton.textContent = editingTask ? "取消编辑" : "清空表单";
  elements.taskTagPicker.innerHTML = renderTaskTagPicker(state.workspace.tags, selectedTagIds);
  setFormDisabled(elements.taskForm, !currentProject);
  syncCompletedDateField(elements.statusInput.value);
}

function renderDetailPanels() {
  const activePanel = state.ui.activeTool === "details" ? state.ui.activeDetailPanel : null;
  const isTaskPanelOpen = activePanel === "task";
  const isPanelOpen = Boolean(activePanel);

  syncOverlayBodyState(isPanelOpen);
  elements.detailPanelBackdrop.hidden = !isPanelOpen;
  elements.detailTaskPanel.hidden = !isTaskPanelOpen;
  elements.detailTaskPanel.setAttribute("aria-hidden", String(!isTaskPanelOpen));
  elements.detailProjectPanelButton.setAttribute("aria-expanded", "false");
  elements.detailTaskPanelButton.setAttribute("aria-expanded", String(isTaskPanelOpen));
}

function syncOverlayBodyState(isCurrentPanelOpen) {
  document.body.classList.toggle(
    "detail-panel-open",
    isCurrentPanelOpen ||
      Boolean(state.ui.activeDetailPanel) ||
      Boolean(state.ui.activeKioskDetailPanel) ||
      Boolean(state.ui.activeAppDetailPanel) ||
      state.ui.projectEditDialogOpen ||
      state.ui.projectCreateDialogOpen
  );
}

function renderTaskFilterControls() {
  const currentProject = state.workspace.currentProject;
  const tags = state.workspace.tags;

  if (state.ui.detailTagFilter !== "all" && !tags.some((tag) => tag.id === state.ui.detailTagFilter)) {
    state.ui.detailTagFilter = "all";
  }

  elements.taskSearchInput.value = state.ui.detailSearch;
  elements.taskStatusFilterInput.value = state.ui.detailStatusFilter;
  elements.taskTagFilterInput.innerHTML = buildTaskTagFilterOptions(tags);
  elements.taskTagFilterInput.value = state.ui.detailTagFilter;
  elements.taskSearchInput.disabled = !currentProject;
  elements.taskStatusFilterInput.disabled = !currentProject;
  elements.taskTagFilterInput.disabled = !currentProject;
  elements.selectedTaskCountBadge.textContent = `已选 ${state.ui.selectedTaskIds.length} 项`;
  elements.selectVisibleTasksButton.disabled = !currentProject;
  elements.bulkStatusInput.disabled = !currentProject || state.ui.selectedTaskIds.length === 0;
  elements.applyBulkStatusButton.disabled =
    !currentProject || state.ui.selectedTaskIds.length === 0;
}

function renderTaskCalendarPanel() {
  const scheduleData = getScheduleCalendarData();
  const tasks = sortTasksForDisplay(scheduleData.tasks);
  const versions = sortVersionsForDisplay(scheduleData.versions);
  const apps = scheduleData.apps;
  const appMap = new Map(apps.map((app) => [app.id, app]));
  const projectMap = new Map(scheduleData.projects.map((project) => [project.id, project]));
  const eventMap =
    scheduleData.loading || scheduleData.error ? new Map() : buildTaskCalendarEventMap(tasks, versions);
  const selectedDate = normalizeCalendarDateKey(state.ui.taskCalendarSelectedDate);
  const monthKey = normalizeCalendarMonthKey(state.ui.taskCalendarMonth, selectedDate);
  const hasScheduleScope = Boolean(scheduleData.filterValue) && !scheduleData.error;

  state.ui.taskCalendarSelectedDate = selectedDate;
  state.ui.taskCalendarMonth = monthKey;

  elements.taskCalendarMonthLabel.textContent = formatCalendarMonthLabel(monthKey);
  elements.taskCalendarPrevButton.disabled = !hasScheduleScope;
  elements.taskCalendarTodayButton.disabled = !hasScheduleScope;
  elements.taskCalendarNextButton.disabled = !hasScheduleScope;
  elements.taskCalendarGrid.innerHTML = renderTaskCalendarGrid(monthKey, selectedDate, eventMap, {
    enabled: hasScheduleScope && !scheduleData.loading,
    appMap,
    projectMap,
    showProjectName: scheduleData.isAllProjects,
  });
  renderTaskCalendarDetails(selectedDate, eventMap, scheduleData, appMap, projectMap);

  if (scheduleData.needsLoad) {
    void loadCloudScheduleAllProjects();
  }
}

function renderTaskCalendarGrid(monthKey, selectedDate, eventMap, options = {}) {
  const {
    enabled = true,
    appMap = new Map(),
    projectMap = new Map(),
    showProjectName = false,
  } = options;
  const monthStartDate = parseCalendarMonthKey(monthKey);
  const firstWeekday = (monthStartDate.getDay() + 6) % 7;
  const gridStartDate = new Date(
    monthStartDate.getFullYear(),
    monthStartDate.getMonth(),
    1 - firstWeekday
  );
  const today = todayString();

  return Array.from({ length: 42 }, (_, index) => {
    const day = new Date(
      gridStartDate.getFullYear(),
      gridStartDate.getMonth(),
      gridStartDate.getDate() + index
    );
    const dateKey = formatDateInputValue(day);
    const entries = eventMap.get(dateKey) || [];
    const isCurrentMonth = dateKey.slice(0, 7) === monthKey;
    const isSelected = dateKey === selectedDate;
    const isToday = dateKey === today;
    const classNames = [
      "task-calendar-day",
      isCurrentMonth ? "" : "is-muted",
      isSelected ? "is-selected" : "",
      isToday ? "is-today" : "",
      entries.length ? "has-task" : "",
    ]
      .filter(Boolean)
      .join(" ");
    const ariaLabel = `${formatCalendarDetailTitle(dateKey)}，${
      entries.length ? `${entries.length} 条安排` : "没有安排"
    }`;

    return `
      <button
        class="${escapeHtml(classNames)}"
        type="button"
        data-calendar-date="${escapeHtml(dateKey)}"
        aria-label="${escapeHtml(ariaLabel)}"
        aria-pressed="${String(isSelected)}"
        ${enabled ? "" : "disabled"}
      >
        <span class="task-calendar-date-number">${escapeHtml(String(day.getDate()))}</span>
        ${entries.length ? `<span class="task-calendar-dot" aria-hidden="true"></span>` : ""}
        ${renderTaskCalendarDayPreview(entries, appMap, projectMap, { showProjectName })}
      </button>
    `;
  }).join("");
}

function renderTaskCalendarDayPreview(
  entries,
  appMap = new Map(),
  projectMap = new Map(),
  options = {}
) {
  if (!entries.length) {
    return "";
  }

  const { showProjectName = false } = options;
  const visibleEntries = entries.slice(0, 2);
  const overflowCount = entries.length - visibleEntries.length;

  return `
    <span class="task-calendar-preview" aria-hidden="true">
      ${visibleEntries
        .map((entry) => {
          const marker = getScheduleCalendarEntryMarker(entry);
          const title = getScheduleCalendarEntryTitle(entry, appMap, projectMap, {
            showProjectName,
          });
          const isDelayed = isScheduleCalendarEntryDelayed(entry);

          return `
            <span class="task-calendar-preview-item ${isDelayed ? "is-delayed" : ""}">
              <span class="task-calendar-preview-marker">${escapeHtml(marker)}</span>
              ${escapeHtml(title)}
            </span>
          `;
        })
        .join("")}
      ${
        overflowCount > 0
          ? `<span class="task-calendar-preview-more">+${escapeHtml(String(overflowCount))} 项</span>`
          : ""
      }
    </span>
  `;
}

function renderTaskCalendarDetails(
  selectedDate,
  eventMap,
  scheduleData,
  appMap = new Map(),
  projectMap = new Map()
) {
  const entries = eventMap.get(selectedDate) || [];
  const tagMap = new Map(scheduleData.tags.map((tag) => [tag.id, tag]));

  elements.taskCalendarDetailTitle.textContent = formatCalendarDetailTitle(selectedDate);
  elements.taskCalendarDetailBadge.textContent =
    scheduleData.filterValue && !scheduleData.loading && !scheduleData.error
      ? `${entries.length} 条安排`
      : "0 条安排";

  if (!scheduleData.filterValue) {
    elements.taskCalendarDetailList.innerHTML = createEmptyInlineMarkup("请先选择项目或所有项目");
    return;
  }

  if (scheduleData.loading) {
    elements.taskCalendarDetailList.innerHTML = createEmptyInlineMarkup("正在加载所有项目日程...");
    return;
  }

  if (scheduleData.error) {
    elements.taskCalendarDetailList.innerHTML = createEmptyInlineMarkup(
      `加载日程失败：${scheduleData.error}`
    );
    return;
  }

  if (!entries.length) {
    elements.taskCalendarDetailList.innerHTML = createEmptyInlineMarkup("当天没有任务或版本");
    return;
  }

  elements.taskCalendarDetailList.innerHTML = entries
    .map((entry) =>
      renderScheduleCalendarDetailEntry(entry, tagMap, appMap, projectMap, {
        showProjectName: scheduleData.isAllProjects,
      })
    )
    .join("");
}

function renderScheduleCalendarDetailEntry(
  entry,
  tagMap,
  appMap,
  projectMap,
  options = {}
) {
  if (entry.kind === "version") {
    return renderVersionCalendarDetailEntry(entry, appMap, projectMap, options);
  }

  return renderTaskCalendarDetailEntry(entry, tagMap, projectMap, options);
}

function renderTaskCalendarDetailEntry(entry, tagMap, projectMap = new Map(), options = {}) {
  const { task, markers } = entry;
  const { showProjectName = false } = options;
  const project = projectMap.get(task.projectId) || null;
  const scheduleStatus = getTaskScheduleStatus(task);
  const taskTags = Array.isArray(task.tagIds)
    ? task.tagIds.map((tagId) => tagMap.get(tagId)).filter(Boolean)
    : [];

  return `
    <article class="task-calendar-detail-item ${scheduleStatus.isDelayed ? "is-delayed" : ""}">
      <div class="task-calendar-detail-title">
        <strong>${escapeHtml(task.title || "未命名任务")}</strong>
        <span class="status-pill status-${escapeHtml(scheduleStatus.className)}">
          ${escapeHtml(scheduleStatus.label)}
        </span>
      </div>

      <div class="meta-row">
        ${markers
          .map(
            (marker) =>
              `<span class="priority-pill priority-medium">${escapeHtml(marker)}</span>`
          )
          .join("")}
        <span class="priority-pill priority-${escapeHtml(task.priority || "medium")}">
          优先级 ${escapeHtml(PRIORITY_META[task.priority]?.label || "中")}
        </span>
        ${
          task.assignee
            ? `<span class="priority-pill priority-low">负责人 ${escapeHtml(task.assignee)}</span>`
            : ""
        }
        ${
          showProjectName && project
            ? `<span class="priority-pill priority-low">项目 ${escapeHtml(project.name)}</span>`
            : ""
        }
      </div>

      ${renderTaskCalendarDateMeta(task)}

      ${
        task.description || task.notes
          ? `<p>${escapeHtml(task.description || task.notes)}</p>`
          : ""
      }

      ${
        taskTags.length
          ? `<div class="meta-row">
              ${taskTags
                .map(
                  (tag) => `
                    <span
                      class="chip category"
                      style="background:${escapeHtml(hexToSoftRgba(tag.color, 0.12))};color:${escapeHtml(
                        tag.color
                      )};"
                    >
                      ${escapeHtml(tag.name)}
                    </span>
                  `
                )
                .join("")}
            </div>`
          : ""
      }
    </article>
  `;
}

function renderTaskCalendarDateMeta(task) {
  const range = getTaskCalendarRange(task);
  const dueDate = isCalendarDateKey(task.dueDate) ? task.dueDate : "";
  const completedDate = isCalendarDateKey(task.completedDate) ? task.completedDate : "";
  const pills = [];

  if (range) {
    pills.push(
      `<span class="priority-pill priority-low">日程 ${escapeHtml(
        formatCalendarDateRangeLabel(range.startDateKey, range.endDateKey)
      )}</span>`
    );
  }

  if (dueDate && range?.endDateKey !== dueDate) {
    const dueLabel =
      task.status === "done" && completedDate && completedDate < dueDate ? "原截止" : "截止";
    pills.push(
      `<span class="priority-pill priority-low">${escapeHtml(dueLabel)} ${escapeHtml(
        formatDateOnly(dueDate)
      )}</span>`
    );
  }

  if (task.status === "done" && completedDate) {
    pills.push(
      `<span class="priority-pill priority-low">完成 ${escapeHtml(
        formatDateOnly(completedDate)
      )}</span>`
    );
  }

  if (!pills.length) {
    return "";
  }

  return `<div class="meta-row">${pills.join("")}</div>`;
}

function formatCalendarDateRangeLabel(startDateKey, endDateKey) {
  if (!startDateKey || !endDateKey || startDateKey === endDateKey) {
    return formatDateOnly(startDateKey || endDateKey);
  }

  return `${formatDateOnly(startDateKey)} 至 ${formatDateOnly(endDateKey)}`;
}

function renderVersionCalendarDetailEntry(
  entry,
  appMap,
  projectMap = new Map(),
  options = {}
) {
  const { version, markers } = entry;
  const { showProjectName = false } = options;
  const app = appMap.get(version.appId) || null;
  const project = app?.projectId ? projectMap.get(app.projectId) : null;

  return `
    <article class="task-calendar-detail-item">
      <div class="task-calendar-detail-title">
        <strong>${escapeHtml(buildVersionDisplayName(version))}</strong>
        <span class="status-pill status-${escapeHtml(version.status || "todo")}">
          ${escapeHtml(VERSION_STATUS_META[version.status]?.label || "待规划")}
        </span>
      </div>

      <div class="meta-row">
        ${markers
          .map(
            (marker) =>
              `<span class="priority-pill priority-medium">${escapeHtml(marker)}</span>`
          )
          .join("")}
        ${
          app
            ? `<span class="priority-pill priority-low">App ${escapeHtml(app.name || "未命名 App")}</span>`
            : ""
        }
        ${
          showProjectName && project
            ? `<span class="priority-pill priority-low">项目 ${escapeHtml(project.name)}</span>`
            : ""
        }
        <span class="priority-pill priority-${escapeHtml(version.priority || "medium")}">
          优先级 ${escapeHtml(PRIORITY_META[version.priority]?.label || "中")}
        </span>
        <span class="priority-pill priority-low">
          渠道 ${escapeHtml(VERSION_CHANNEL_META[version.channel]?.label || "正式发布")}
        </span>
        ${
          version.owner
            ? `<span class="priority-pill priority-low">负责人 ${escapeHtml(version.owner)}</span>`
            : ""
        }
      </div>

      ${
        version.description
          ? `<p>${escapeHtml(version.description)}</p>`
          : ""
      }
      ${
        version.notes
          ? `<p><strong>备注：</strong>${escapeHtml(version.notes)}</p>`
          : ""
      }

      <div class="meta-row">
        ${
          version.buildNumber
            ? `<span class="priority-pill priority-low">构建 ${escapeHtml(version.buildNumber)}</span>`
            : ""
        }
        ${
          version.resourceVersion
            ? `<span class="priority-pill priority-low">资源 ${escapeHtml(version.resourceVersion)}</span>`
            : ""
        }
        ${
          version.plannedDate
            ? `<span class="priority-pill priority-low">计划 ${escapeHtml(
                formatDateOnly(version.plannedDate)
              )}</span>`
            : ""
        }
        ${
          version.releaseDate
            ? `<span class="priority-pill priority-low">发布 ${escapeHtml(
                formatDateOnly(version.releaseDate)
              )}</span>`
            : ""
        }
        ${
          version.publishedDate
            ? `<span class="priority-pill priority-low">上线 ${escapeHtml(
                formatDateOnly(version.publishedDate)
              )}</span>`
            : ""
        }
      </div>
    </article>
  `;
}

function buildTaskCalendarEventMap(tasks, versions = []) {
  const eventMap = new Map();

  tasks.forEach((task) => {
    appendScheduleCalendarEntries(eventMap, {
      kind: "task",
      item: task,
      markersByDate: collectTaskCalendarMarkers(task),
    });
  });

  versions.forEach((version) => {
    appendScheduleCalendarEntries(eventMap, {
      kind: "version",
      item: version,
      markersByDate: collectVersionCalendarMarkers(version),
    });
  });

  return eventMap;
}

function collectTaskCalendarMarkers(task) {
  const range = getTaskCalendarRange(task);
  const markersByDate = new Map();

  if (!range) {
    return markersByDate;
  }

  const cursor = parseCalendarDateKey(range.startDateKey);
  const endDate = parseCalendarDateKey(range.endDateKey);
  const isOverdue = isTaskOverdue(task);

  while (cursor <= endDate) {
    const dateKey = formatDateInputValue(cursor);
    const markers = [];

    if (isOverdue && range.hasDueDate && dateKey >= task.dueDate) {
      markers.push("延期");
    }

    if (range.hasStartDate && dateKey === task.startDate) {
      markers.push("开始");
    }

    if (range.hasDueDate && dateKey === task.dueDate) {
      markers.push("截止");
    }

    if (range.hasCompletedDate && task.status === "done" && dateKey === task.completedDate) {
      markers.push("完成");
    }

    if (!markers.length) {
      markers.push("持续");
    }

    markersByDate.set(dateKey, markers);
    cursor.setDate(cursor.getDate() + 1);
  }

  return markersByDate;
}

function getTaskCalendarRange(task) {
  const hasStartDate = isCalendarDateKey(task.startDate);
  const hasDueDate = isCalendarDateKey(task.dueDate);
  const hasCompletedDate = isCalendarDateKey(task.completedDate);
  const today = todayString();
  const shouldExtendOverdueTask =
    hasDueDate && task.status !== "done" && task.dueDate < today;

  if (!hasStartDate && !hasDueDate && !hasCompletedDate) {
    return null;
  }

  let startDateKey = "";
  let endDateKey = "";

  if (hasStartDate) {
    startDateKey = task.startDate;
    if (task.status === "done" && hasCompletedDate) {
      endDateKey = task.completedDate;
    } else if (shouldExtendOverdueTask) {
      endDateKey = today;
    } else if (hasDueDate) {
      endDateKey = task.dueDate;
    } else {
      endDateKey = task.startDate;
    }
  } else if (hasDueDate) {
    startDateKey = task.status === "done" && hasCompletedDate ? task.completedDate : task.dueDate;
    endDateKey = shouldExtendOverdueTask ? today : startDateKey;
  } else {
    startDateKey = task.completedDate;
    endDateKey = task.completedDate;
  }

  const startDate = parseCalendarDateKey(startDateKey);
  const endDate = parseCalendarDateKey(endDateKey);

  if (startDate > endDate) {
    return {
      startDateKey: endDateKey,
      endDateKey: startDateKey,
      hasStartDate,
      hasDueDate,
      hasCompletedDate,
    };
  }

  return {
    startDateKey,
    endDateKey,
    hasStartDate,
    hasDueDate,
    hasCompletedDate,
  };
}

function collectVersionCalendarMarkers(version) {
  const markersByDate = new Map();
  const addMarker = (dateKey, marker) => {
    if (!isCalendarDateKey(dateKey)) {
      return;
    }

    const markers = markersByDate.get(dateKey) || [];
    if (!markers.includes(marker)) {
      markers.push(marker);
    }
    markersByDate.set(dateKey, markers);
  };

  addMarker(version.plannedDate, "计划");
  addMarker(version.releaseDate, "发布");
  addMarker(version.publishedDate, "上线");

  return markersByDate;
}

function appendScheduleCalendarEntries(eventMap, entrySource) {
  const { kind, item, markersByDate } = entrySource;

  markersByDate.forEach((markers, dateKey) => {
    const entries = eventMap.get(dateKey) || [];
    entries.push({
      kind,
      [kind]: item,
      markers,
    });
    eventMap.set(dateKey, entries);
  });
}

function getScheduleCalendarEntryMarker(entry) {
  return entry.markers[0] || (entry.kind === "version" ? "版本" : "任务");
}

function isScheduleCalendarEntryDelayed(entry) {
  return entry.kind === "task" && isTaskOverdue(entry.task);
}

function getTaskScheduleStatus(task) {
  if (isTaskOverdue(task)) {
    return {
      className: "delayed",
      label: "已延期",
      isDelayed: true,
    };
  }

  const status = STATUS_META[task.status] ? task.status : "todo";

  return {
    className: status,
    label: STATUS_META[status].label,
    isDelayed: false,
  };
}

function isTaskOverdue(task, referenceDate = todayString()) {
  if (!task || task.status === "done" || !isCalendarDateKey(task.dueDate)) {
    return false;
  }

  const normalizedReferenceDate = normalizeCalendarDateKey(referenceDate);
  return task.dueDate < normalizedReferenceDate;
}

function getScheduleCalendarEntryTitle(entry, appMap = new Map()) {
  if (entry.kind === "version") {
    const version = entry.version;
    const app = appMap.get(version.appId) || null;
    const versionName = buildVersionDisplayName(version);
    return app?.name ? `${app.name} · ${versionName}` : versionName;
  }

  return entry.task.title || "未命名任务";
}

function renderTaskListPanel() {
  const currentProject = state.workspace.currentProject;
  const tasks = sortTasksForDisplay(state.workspace.tasks);
  const filteredTasks = getFilteredDetailTasks(tasks, state.workspace.tags);
  const tagMap = new Map(state.workspace.tags.map((tag) => [tag.id, tag]));
  const isFilterActive = hasActiveTaskFilters();
  const allFilteredSelected =
    filteredTasks.length > 0 &&
    filteredTasks.every((task) => state.ui.selectedTaskIds.includes(task.id));

  state.ui.expandedTaskRecordIds = state.ui.expandedTaskRecordIds.filter((taskId) =>
    tasks.some((task) => task.id === taskId)
  );

  elements.taskListSummary.textContent = currentProject
    ? isFilterActive
      ? `${filteredTasks.length} / ${tasks.length} 项任务`
      : `${tasks.length} 项任务`
    : "0 项任务";
  elements.selectVisibleTasksButton.textContent = allFilteredSelected
    ? "取消当前结果"
    : "选择当前结果";
  elements.selectedTaskCountBadge.textContent = `已选 ${state.ui.selectedTaskIds.length} 项`;
  elements.bulkStatusInput.disabled = !currentProject || state.ui.selectedTaskIds.length === 0;
  elements.applyBulkStatusButton.disabled =
    !currentProject || state.ui.selectedTaskIds.length === 0;
  elements.detailCurrentProjectMeta.textContent = currentProject
    ? `${buildProjectMetaCopy(currentProject, tasks)}${
        isFilterActive ? ` 当前筛选后显示 ${filteredTasks.length} 项。` : ""
      }`
    : "这里会列出当前项目的全部任务、状态和时间信息。";

  if (!currentProject) {
    elements.taskDetailList.innerHTML = createEmptyStateMarkup(
      "还没有项目",
      "先通过“项目管理”创建项目，然后再在这里查看和维护任务。"
    );
    return;
  }

  if (!tasks.length) {
    elements.taskDetailList.innerHTML = createEmptyStateMarkup(
      "项目里还没有任务",
      "点击右上角“新建任务”，为当前项目录入第一条任务。"
    );
    return;
  }

  if (!filteredTasks.length) {
    elements.taskDetailList.innerHTML = createEmptyStateMarkup(
      "没有匹配的任务",
      "试试清空搜索词，或者放宽状态和标签筛选条件。"
    );
    return;
  }

  elements.taskDetailList.innerHTML = filteredTasks
    .map((task) => renderTaskRecord(task, tagMap))
    .join("");
}

function renderTaskRecord(task, tagMap) {
  const completedSubtasks = Array.isArray(task.subtasks)
    ? task.subtasks.filter((subtask) => subtask.completed).length
    : 0;
  const taskTags = task.tagIds
    .map((tagId) => tagMap.get(tagId))
    .filter(Boolean);
  const isSelected = state.ui.selectedTaskIds.includes(task.id);
  const isExpanded = state.ui.expandedTaskRecordIds.includes(task.id);

  return `
    <article class="task-record-card">
      <div class="task-record-head">
        <div class="task-record-title">
          <div class="task-record-title-row">
            <label class="task-select-toggle">
              <input
                type="checkbox"
                data-task-select-id="${escapeHtml(task.id)}"
                ${isSelected ? "checked" : ""}
              />
            </label>
            <h3>${escapeHtml(task.title || "未命名任务")}</h3>
            <span class="status-pill status-${escapeHtml(task.status)}">
              ${escapeHtml(STATUS_META[task.status]?.label || "未开始")}
            </span>
          </div>
        </div>

        <div class="task-record-actions">
          <button
            class="ghost-button mini-button"
            type="button"
            data-task-collapse-id="${escapeHtml(task.id)}"
            aria-expanded="${String(isExpanded)}"
          >
            ${isExpanded ? "收起" : "展开"}
          </button>
          <button
            class="ghost-button mini-button"
            type="button"
            data-task-action="edit"
            data-task-id="${escapeHtml(task.id)}"
          >
            编辑
          </button>
          <button
            class="danger-button mini-button"
            type="button"
            data-task-action="delete"
            data-task-id="${escapeHtml(task.id)}"
          >
            删除
          </button>
        </div>
      </div>

      <div class="task-record-controls">
        <label class="inline-control">
          <span>状态</span>
          <select
            class="task-status-select"
            data-task-status-id="${escapeHtml(task.id)}"
            aria-label="切换任务状态"
          >
            ${buildStatusOptions(task.status)}
          </select>
        </label>

        <div class="meta-row">
          ${
            task.assignee
              ? `<span class="priority-pill priority-medium">负责人 ${escapeHtml(
                  task.assignee
                )}</span>`
              : `<span class="priority-pill priority-low">未分配负责人</span>`
          }
          <span class="priority-pill priority-${escapeHtml(task.priority)}">
            优先级 ${escapeHtml(PRIORITY_META[task.priority]?.label || "中")}
          </span>
          ${
            task.startDate
              ? `<span class="priority-pill priority-low">开始 ${escapeHtml(
                  formatDateOnly(task.startDate)
                )}</span>`
              : `<span class="priority-pill priority-low">未设置开始日期</span>`
          }
          ${
            task.dueDate
              ? `<span class="priority-pill priority-low">截止 ${escapeHtml(
                  formatDateOnly(task.dueDate)
                )}</span>`
              : `<span class="priority-pill priority-low">未设置截止日期</span>`
          }
          ${
            task.completedDate
              ? `<span class="priority-pill priority-done">完成 ${escapeHtml(
                  formatDateOnly(task.completedDate)
                )}</span>`
              : ""
          }
          ${
            Array.isArray(task.subtasks) && task.subtasks.length
              ? `<span class="priority-pill priority-medium">子任务 ${escapeHtml(
                  `${completedSubtasks}/${task.subtasks.length}`
                )}</span>`
              : ""
          }
        </div>
      </div>

      <div class="task-record-body" ${isExpanded ? "" : "hidden"}>
        <p class="task-description">
          ${escapeHtml(task.description || "这个任务暂时还没有补充说明。")}
        </p>
        ${
          task.notes
            ? `<p class="task-note"><strong>备注：</strong>${escapeHtml(task.notes)}</p>`
            : ""
        }
        ${
          taskTags.length
            ? `<div class="meta-row">
                ${taskTags
                  .map(
                    (tag) => `
                      <span
                        class="chip category"
                        style="background:${escapeHtml(hexToSoftRgba(tag.color, 0.12))};color:${escapeHtml(
                          tag.color
                        )};"
                      >
                        ${escapeHtml(tag.name)}
                      </span>
                    `
                  )
                  .join("")}
              </div>`
            : ""
        }
        ${
          Array.isArray(task.subtasks) && task.subtasks.length
            ? `
              <div class="subtask-list">
                ${task.subtasks
                  .map(
                    (subtask) => `
                      <label class="subtask-item ${subtask.completed ? "is-done" : ""}">
                        <input
                          type="checkbox"
                          data-subtask-id="${escapeHtml(subtask.id)}"
                          data-parent-task-id="${escapeHtml(task.id)}"
                          ${subtask.completed ? "checked" : ""}
                        />
                        <span>${escapeHtml(subtask.title)}</span>
                      </label>
                    `
                  )
                  .join("")}
              </div>
            `
            : ""
        }

        <div class="task-record-meta">
          <span>创建于 ${escapeHtml(formatDateTime(task.createdAt))}</span>
          <span>更新于 ${escapeHtml(formatDateTime(task.updatedAt))}</span>
        </div>
      </div>
    </article>
  `;
}

function renderTaskTagPicker(tags, selectedTagIds) {
  if (!tags.length) {
    return createEmptyInlineMarkup("当前项目还没有标签，可先在项目管理模块中创建");
  }

  const selectedIds = new Set(selectedTagIds);
  return tags
    .map((tag) => {
      const isSelected = selectedIds.has(tag.id);
      return `
        <button
          class="selectable-tag ${isSelected ? "is-selected" : ""}"
          type="button"
          data-tag-id="${escapeHtml(tag.id)}"
          data-tag-picker="task"
          aria-pressed="${String(isSelected)}"
          style="--tag-color:${escapeHtml(tag.color || "#245a73")};"
        >
          ${escapeHtml(tag.name)}
        </button>
      `;
    })
    .join("");
}

function buildTaskTagFilterOptions(tags) {
  return [
    `<option value="all">全部标签</option>`,
    ...tags.map(
      (tag) => `<option value="${escapeHtml(tag.id)}">${escapeHtml(tag.name)}</option>`
    ),
  ].join("");
}

function getFilteredDetailTasks(tasks, tags) {
  const search = state.ui.detailSearch.trim().toLowerCase();
  const statusFilter = state.ui.detailStatusFilter;
  const tagFilter = state.ui.detailTagFilter;
  const tagMap = new Map(tags.map((tag) => [tag.id, tag]));

  return tasks.filter((task) => {
    if (statusFilter !== "all" && task.status !== statusFilter) {
      return false;
    }

    if (tagFilter !== "all" && !task.tagIds.includes(tagFilter)) {
      return false;
    }

    if (!search) {
      return true;
    }

    const taskTagNames = task.tagIds
      .map((tagId) => tagMap.get(tagId)?.name || "")
      .filter(Boolean)
      .join(" ");
    const subtaskNames = Array.isArray(task.subtasks)
      ? task.subtasks.map((subtask) => subtask.title).join(" ")
      : "";
    const haystack = [
      task.title,
      task.assignee,
      task.description,
      task.notes,
      task.startDate,
      task.completedDate,
      taskTagNames,
      subtaskNames,
      STATUS_META[task.status]?.label || "",
    ]
      .join(" ")
      .toLowerCase();

    return haystack.includes(search);
  });
}

function hasActiveTaskFilters() {
  return (
    Boolean(state.ui.detailSearch) ||
    state.ui.detailStatusFilter !== "all" ||
    state.ui.detailTagFilter !== "all"
  );
}

function resetTaskDetailFilters() {
  state.ui.detailSearch = "";
  state.ui.detailStatusFilter = "all";
  state.ui.detailTagFilter = "all";
}

function renderAppOverview() {
  const currentProject = state.workspace.currentProject;
  const overview = state.appWorkspace.overview || createEmptyAppOverview();
  const totals = overview.totals || createEmptyAppOverview().totals;
  const releaseRate = totals.versionCount
    ? Math.round((totals.doneCount / totals.versionCount) * 100)
    : 0;
  const appSummaries = Array.isArray(overview.apps) ? overview.apps : [];

  state.ui.expandedAppOverviewIds = state.ui.expandedAppOverviewIds.filter((appId) =>
    appSummaries.some((app) => app.id === appId)
  );

  elements.appOverviewAppCount.textContent = String(totals.appCount || 0);
  elements.appOverviewActiveAppCount.textContent = String(totals.activeAppCount || 0);
  elements.appOverviewVersionCount.textContent = String(totals.versionCount || 0);
  elements.appOverviewReleaseRate.textContent = `${releaseRate}%`;
  elements.appOverviewTodoCount.textContent = String(totals.todoCount || 0);
  elements.appOverviewDoingCount.textContent = String(totals.doingCount || 0);
  elements.appOverviewReviewCount.textContent = String(totals.reviewCount || 0);
  elements.appOverviewDoneCount.textContent = String(totals.doneCount || 0);

  if (!currentProject) {
    elements.appVersionOverviewList.innerHTML = createEmptyStateMarkup(
      "还没有项目",
      "请先在项目管理里创建项目，再到这里查看对应项目下的 App 版本进度。"
    );
    return;
  }

  if (!appSummaries.length) {
    elements.appVersionOverviewList.innerHTML = createEmptyStateMarkup(
      "还没有 App",
      `项目“${currentProject.name}”下还没有 App，先到 App 版本管理页创建应用。`
    );
    return;
  }

  elements.appVersionOverviewList.innerHTML = appSummaries
    .map((app) => {
      const recentVersions = Array.isArray(app.recentVersions) ? app.recentVersions : [];
      const isExpanded = state.ui.expandedAppOverviewIds.includes(app.id);

      return `
        <article class="project-overview-card">
          <div class="project-overview-head">
            <div class="project-overview-title">
              <div class="project-overview-title-row">
                <span
                  class="project-overview-dot"
                  style="--project-color: ${escapeHtml(app.color || "#245a73")};"
                ></span>
                <h3>${escapeHtml(app.name || "未命名 App")}</h3>
              </div>
              <div class="meta-row">
                <span class="status-pill ${app.archived ? "status-review" : "status-doing"}">
                  ${app.archived ? "已归档" : "活跃"}
                </span>
                <span class="priority-pill priority-medium">
                  ${escapeHtml(APP_PLATFORM_META[app.platform]?.label || app.platform || "未知平台")}
                </span>
                <span class="priority-pill priority-high">总版本 ${escapeHtml(app.versionCount)}</span>
              </div>
            </div>

            <div class="project-overview-actions">
              <button
                class="ghost-button mini-button"
                type="button"
                data-app-collapse-id="${escapeHtml(app.id)}"
                aria-expanded="${String(isExpanded)}"
              >
                ${isExpanded ? "收起" : "展开"}
              </button>
              <button
                class="ghost-button mini-button"
                type="button"
                data-open-app-id="${escapeHtml(app.id)}"
              >
                查看详情
              </button>
            </div>
          </div>

          <p class="project-overview-copy" ${isExpanded ? "" : "hidden"}>
            ${escapeHtml(app.description || "这个 App 暂时还没有补充说明。")}
          </p>

          <div class="project-overview-metrics">
            <span class="status-pill status-todo">待规划 ${escapeHtml(app.todoCount)}</span>
            <span class="status-pill status-doing">开发中 ${escapeHtml(app.doingCount)}</span>
            <span class="status-pill status-review">待发布 ${escapeHtml(app.reviewCount)}</span>
            <span class="status-pill status-done">已发布 ${escapeHtml(app.doneCount)}</span>
          </div>

          <div class="recent-task-list" ${isExpanded ? "" : "hidden"}>
            ${
              recentVersions.length
                ? recentVersions
                    .map(
                      (version) => `
                        <div class="recent-task-item">
                          <div class="recent-task-head">
                            <strong>${escapeHtml(buildVersionDisplayName(version))}</strong>
                            <span class="status-pill status-${escapeHtml(version.status || "todo")}">
                              ${escapeHtml(VERSION_STATUS_META[version.status]?.label || "待规划")}
                            </span>
                          </div>
                          <div class="recent-task-meta">
                            <span class="priority-pill priority-${escapeHtml(
                              version.priority || "medium"
                            )}">
                              渠道 ${escapeHtml(
                                VERSION_CHANNEL_META[version.channel]?.label || "正式发布"
                              )}
                            </span>
                            <span>
                              构建 ${escapeHtml(version.buildNumber || "未填")}
                            </span>
                            ${
                              version.resourceVersion
                                ? `<span>资源 ${escapeHtml(version.resourceVersion)}</span>`
                                : ""
                            }
                            <span>更新于 ${escapeHtml(formatDateTime(version.updatedAt))}</span>
                          </div>
                        </div>
                      `
                    )
                    .join("")
                : `<div class="empty-inline">该应用还没有版本，点击详情后可直接创建。</div>`
            }
          </div>
        </article>
      `;
    })
    .join("");
}

function renderAppDetails() {
  const currentProject = state.workspace.currentProject;
  const apps = state.appWorkspace.apps;
  const currentApp = state.appWorkspace.currentApp;
  const isAppCreateMode =
    state.ui.appFormMode === "create" || !currentApp || !state.ui.editingAppId;

  elements.appDetailProjectName.textContent = currentProject?.name || "暂无项目";
  elements.appDetailAppCountBadge.textContent = `${apps.length} 个 App`;
  elements.appDetailAppSelect.innerHTML = buildProjectOptions(apps, "暂无 App");
  elements.appDetailAppSelect.value = currentApp?.id || "";
  elements.appDetailAppSelect.disabled = !apps.length;
  elements.appDetailAppPanelButton.disabled = !currentProject;
  elements.appDetailVersionPanelButton.disabled = !currentApp;

  elements.appIdInput.value = isAppCreateMode ? "" : currentApp?.id || "";
  elements.appNameInput.value = isAppCreateMode ? "" : currentApp?.name || "";
  elements.appColorInput.value = currentApp?.color || "#245a73";
  elements.appPlatformInput.value = currentApp?.platform || "ios";
  elements.appBundleIdInput.value = isAppCreateMode ? "" : currentApp?.bundleId || "";
  elements.appDescriptionInput.value = isAppCreateMode ? "" : currentApp?.description || "";
  elements.appSubmitButton.textContent = isAppCreateMode ? "创建 App" : "保存 App";
  elements.appArchiveButton.textContent = currentApp?.archived ? "取消归档" : "归档 App";
  elements.appArchiveButton.disabled = !currentApp || isAppCreateMode || !currentProject;
  elements.appDeleteButton.disabled = !currentApp || isAppCreateMode || !currentProject;
  setFormDisabled(elements.appForm, !currentProject);

  if (!currentProject) {
    elements.appFormCopy.textContent =
      "请先到“项目管理”模块选择项目，再在该项目下维护 App。";
  } else if (!currentApp) {
    elements.appFormCopy.textContent = `项目“${currentProject.name}”下还没有 App，先创建一个应用作为版本容器。`;
  } else if (isAppCreateMode) {
    elements.appFormCopy.textContent = `正在为项目“${currentProject.name}”创建新 App。当前版本列表仍显示应用“${currentApp.name}”的内容。`;
  } else {
    elements.appFormCopy.textContent = `当前正在编辑项目“${currentProject.name}”下的 App “${currentApp.name}”，可以修改平台、颜色、标识和说明。`;
  }

  renderVersionEditor();
  renderVersionFilterControls();
  renderVersionListPanel();
  renderAppDetailPanels();
}

function renderVersionEditor() {
  const currentProject = state.workspace.currentProject;
  const currentApp = state.appWorkspace.currentApp;
  const versions = sortVersionsForDisplay(state.appWorkspace.versions);
  const editingVersion =
    versions.find((version) => version.id === state.ui.editingVersionId) || null;

  elements.versionEditorModeBadge.textContent = editingVersion ? "编辑版本" : "新版本";
  elements.versionAppHint.textContent = currentApp
    ? `当前项目：${currentProject?.name || "未选择"}，当前 App：${currentApp.name}。这里可以维护版本号、构建号、资源版本、渠道、状态、优先级、日期和发布备注，其中版本号、构建号、资源版本至少填写一项。`
    : "请先选择项目和 App，再在这里录入版本。";
  elements.versionIdInput.value = editingVersion?.id || "";
  elements.versionNameInput.value = editingVersion?.versionName || "";
  elements.buildNumberInput.value = editingVersion?.buildNumber || "";
  elements.resourceVersionInput.value = editingVersion?.resourceVersion || "";
  elements.versionDescriptionInput.value = editingVersion?.description || "";
  elements.versionNotesInput.value = editingVersion?.notes || "";
  elements.versionOwnerInput.value = editingVersion?.owner || "";
  elements.versionChannelInput.value = editingVersion?.channel || "stable";
  elements.versionStatusInput.value = editingVersion?.status || "todo";
  elements.versionPriorityInput.value = editingVersion?.priority || "medium";
  elements.plannedDateInput.value = editingVersion?.plannedDate || "";
  elements.releaseDateInput.value = editingVersion?.releaseDate || "";
  elements.publishedDateInput.value = editingVersion?.publishedDate || "";
  elements.versionSubmitButton.textContent = editingVersion ? "保存版本" : "创建版本";
  elements.versionResetButton.textContent = editingVersion ? "取消编辑" : "清空表单";
  setFormDisabled(elements.versionForm, !currentApp);
  syncPublishedDateField(elements.versionStatusInput.value);
}

function renderAppDetailPanels() {
  const activePanel =
    state.ui.activeTool === "app-details" ? state.ui.activeAppDetailPanel : null;
  const isAppPanelOpen = activePanel === "app";
  const isVersionPanelOpen = activePanel === "version";
  const isPanelOpen = Boolean(activePanel);

  syncOverlayBodyState(isPanelOpen);
  elements.appDetailPanelBackdrop.hidden = !isPanelOpen;
  elements.appDetailAppPanel.hidden = !isAppPanelOpen;
  elements.appDetailVersionPanel.hidden = !isVersionPanelOpen;
  elements.appDetailAppPanel.setAttribute("aria-hidden", String(!isAppPanelOpen));
  elements.appDetailVersionPanel.setAttribute("aria-hidden", String(!isVersionPanelOpen));
  elements.appDetailAppPanelButton.setAttribute("aria-expanded", String(isAppPanelOpen));
  elements.appDetailVersionPanelButton.setAttribute("aria-expanded", String(isVersionPanelOpen));
}

function renderProjectCreateDialog() {
  const isOpen = state.ui.projectCreateDialogOpen;
  elements.projectCreateDialogBackdrop.hidden = !isOpen;
  elements.projectCreateDialog.hidden = !isOpen;
  elements.projectCreateDialog.setAttribute("aria-hidden", String(!isOpen));
}

function renderVersionFilterControls() {
  const currentApp = state.appWorkspace.currentApp;

  elements.versionSearchInput.value = state.ui.versionDetailSearch;
  elements.versionBundleIdDisplayInput.value = currentApp?.bundleId || "";
  elements.versionBundleIdDisplayInput.placeholder = currentApp
    ? "当前 App 未设置包名 / 标识"
    : "先选择 App";
  elements.versionStatusFilterInput.value = state.ui.versionDetailStatusFilter;
  elements.versionChannelFilterInput.value = state.ui.versionDetailChannelFilter;
  elements.versionSearchInput.disabled = !currentApp;
  elements.versionBundleIdDisplayInput.disabled = !currentApp;
  elements.versionStatusFilterInput.disabled = !currentApp;
  elements.versionChannelFilterInput.disabled = !currentApp;
  elements.selectedVersionCountBadge.textContent = `已选 ${state.ui.selectedVersionIds.length} 项`;
  elements.selectVisibleVersionsButton.disabled = !currentApp;
  elements.bulkVersionStatusInput.disabled =
    !currentApp || state.ui.selectedVersionIds.length === 0;
  elements.applyBulkVersionStatusButton.disabled =
    !currentApp || state.ui.selectedVersionIds.length === 0;
}

function renderVersionListPanel() {
  const currentProject = state.workspace.currentProject;
  const currentApp = state.appWorkspace.currentApp;
  const versions = sortVersionsForDisplay(state.appWorkspace.versions);
  const filteredVersions = getFilteredAppVersions(versions);
  const isFilterActive = hasActiveVersionFilters();
  const allFilteredSelected =
    filteredVersions.length > 0 &&
    filteredVersions.every((version) => state.ui.selectedVersionIds.includes(version.id));

  state.ui.expandedVersionRecordIds = state.ui.expandedVersionRecordIds.filter((versionId) =>
    versions.some((version) => version.id === versionId)
  );

  elements.versionListSummary.textContent = currentApp
    ? isFilterActive
      ? `${filteredVersions.length} / ${versions.length} 个版本`
      : `${versions.length} 个版本`
    : "0 个版本";
  elements.selectVisibleVersionsButton.textContent = allFilteredSelected
    ? "取消当前结果"
    : "选择当前结果";
  elements.selectedVersionCountBadge.textContent = `已选 ${state.ui.selectedVersionIds.length} 项`;
  elements.bulkVersionStatusInput.disabled =
    !currentApp || state.ui.selectedVersionIds.length === 0;
  elements.applyBulkVersionStatusButton.disabled =
    !currentApp || state.ui.selectedVersionIds.length === 0;
  elements.appDetailCurrentMeta.textContent = currentApp
    ? `${buildAppMetaCopy(currentApp, versions)}${
        isFilterActive ? ` 当前筛选后显示 ${filteredVersions.length} 个版本。` : ""
      }`
    : currentProject
      ? `这里会列出项目“${currentProject.name}”下当前 App 的全部版本、状态和发布时间信息。`
      : "这里会列出当前项目下 App 的全部版本、状态和发布时间信息。";

  if (!currentProject) {
    elements.versionDetailList.innerHTML = createEmptyStateMarkup(
      "还没有项目",
      "请先到“项目管理”模块选择或创建项目，再到这里管理 App 和版本。"
    );
    return;
  }

  if (!currentApp) {
    elements.versionDetailList.innerHTML = createEmptyStateMarkup(
      "还没有 App",
      `项目“${currentProject.name}”下还没有 App，先通过“App 管理”创建应用。`
    );
    return;
  }

  if (!versions.length) {
    elements.versionDetailList.innerHTML = createEmptyStateMarkup(
      "应用里还没有版本",
      "点击右上角“新建版本”，为当前 App 录入第一条版本记录。"
    );
    return;
  }

  if (!filteredVersions.length) {
    elements.versionDetailList.innerHTML = createEmptyStateMarkup(
      "没有匹配的版本",
      "试试清空搜索词，或者放宽状态和渠道筛选条件。"
    );
    return;
  }

  elements.versionDetailList.innerHTML = filteredVersions
    .map((version) => renderVersionRecord(version))
    .join("");
}

function renderVersionRecord(version) {
  const isSelected = state.ui.selectedVersionIds.includes(version.id);
  const isExpanded = state.ui.expandedVersionRecordIds.includes(version.id);
  const displayName = buildVersionDisplayName(version);

  return `
    <article class="task-record-card">
      <div class="task-record-head">
        <div class="task-record-title">
          <div class="task-record-title-row">
            <label class="task-select-toggle">
              <input
                type="checkbox"
                data-version-select-id="${escapeHtml(version.id)}"
                ${isSelected ? "checked" : ""}
              />
            </label>
            <h3>${escapeHtml(displayName)}</h3>
            <span class="status-pill status-${escapeHtml(version.status)}">
              ${escapeHtml(VERSION_STATUS_META[version.status]?.label || "待规划")}
            </span>
          </div>
        </div>

        <div class="task-record-actions">
          <button
            class="ghost-button mini-button"
            type="button"
            data-version-collapse-id="${escapeHtml(version.id)}"
            aria-expanded="${String(isExpanded)}"
          >
            ${isExpanded ? "收起" : "展开"}
          </button>
          <button
            class="ghost-button mini-button"
            type="button"
            data-version-action="edit"
            data-version-id="${escapeHtml(version.id)}"
          >
            编辑
          </button>
          <button
            class="ghost-button mini-button"
            type="button"
            data-version-action="copy"
            data-version-id="${escapeHtml(version.id)}"
          >
            复制版本信息
          </button>
          <button
            class="danger-button mini-button"
            type="button"
            data-version-action="delete"
            data-version-id="${escapeHtml(version.id)}"
          >
            删除
          </button>
        </div>
      </div>

      <div class="task-record-controls">
        <label class="inline-control">
          <span>状态</span>
          <select
            class="task-status-select"
            data-version-status-id="${escapeHtml(version.id)}"
            aria-label="切换版本状态"
          >
            ${buildVersionStatusOptions(version.status)}
          </select>
        </label>

        <div class="meta-row">
          <span class="priority-pill priority-${escapeHtml(version.priority)}">
            优先级 ${escapeHtml(PRIORITY_META[version.priority]?.label || "中")}
          </span>
          <span class="priority-pill priority-medium">
            渠道 ${escapeHtml(VERSION_CHANNEL_META[version.channel]?.label || "正式发布")}
          </span>
          ${
            version.owner
              ? `<span class="priority-pill priority-low">负责人 ${escapeHtml(version.owner)}</span>`
              : `<span class="priority-pill priority-low">未分配负责人</span>`
          }
          ${
            version.buildNumber
              ? `<span class="priority-pill priority-low">构建 ${escapeHtml(
                  version.buildNumber
                )}</span>`
              : `<span class="priority-pill priority-low">未设置构建号</span>`
          }
          ${
            version.resourceVersion
              ? `<span class="priority-pill priority-low">资源 ${escapeHtml(
                  version.resourceVersion
                )}</span>`
              : ""
          }
          ${
            version.plannedDate
              ? `<span class="priority-pill priority-low">开始 ${escapeHtml(
                  formatDateOnly(version.plannedDate)
                )}</span>`
              : `<span class="priority-pill priority-low">未设置开始日期</span>`
          }
          ${
            version.releaseDate
              ? `<span class="priority-pill priority-low">计划发布 ${escapeHtml(
                  formatDateOnly(version.releaseDate)
                )}</span>`
              : `<span class="priority-pill priority-low">未设置发布日期</span>`
          }
          ${
            version.publishedDate
              ? `<span class="priority-pill priority-done">已发布 ${escapeHtml(
                  formatDateOnly(version.publishedDate)
                )}</span>`
              : ""
          }
        </div>
      </div>

      <div class="task-record-body" ${isExpanded ? "" : "hidden"}>
        <p class="task-description">
          ${escapeHtml(version.description || "这个版本暂时还没有补充说明。")}
        </p>
        ${
          version.notes
            ? `<p class="task-note"><strong>备注：</strong>${escapeHtml(version.notes)}</p>`
            : ""
        }

        <div class="task-record-meta">
          <span>创建于 ${escapeHtml(formatDateTime(version.createdAt))}</span>
          <span>更新于 ${escapeHtml(formatDateTime(version.updatedAt))}</span>
        </div>
      </div>
    </article>
  `;
}

function getFilteredAppVersions(versions) {
  const search = state.ui.versionDetailSearch.trim().toLowerCase();
  const statusFilter = state.ui.versionDetailStatusFilter;
  const channelFilter = state.ui.versionDetailChannelFilter;

  return versions.filter((version) => {
    if (statusFilter !== "all" && version.status !== statusFilter) {
      return false;
    }

    if (channelFilter !== "all" && version.channel !== channelFilter) {
      return false;
    }

    if (!search) {
      return true;
    }

    const haystack = [
      version.versionName,
      version.buildNumber,
      version.resourceVersion,
      version.owner,
      version.description,
      version.notes,
      version.plannedDate,
      version.releaseDate,
      version.publishedDate,
      VERSION_STATUS_META[version.status]?.label || "",
      VERSION_CHANNEL_META[version.channel]?.label || "",
    ]
      .join(" ")
      .toLowerCase();

    return haystack.includes(search);
  });
}

function hasActiveVersionFilters() {
  return (
    Boolean(state.ui.versionDetailSearch) ||
    state.ui.versionDetailStatusFilter !== "all" ||
    state.ui.versionDetailChannelFilter !== "all"
  );
}

function resetVersionDetailFilters() {
  state.ui.versionDetailSearch = "";
  state.ui.versionDetailStatusFilter = "all";
  state.ui.versionDetailChannelFilter = "all";
}

function buildVersionStatusOptions(selectedStatus) {
  return STATUS_ORDER.map(
    (status) => `
      <option value="${escapeHtml(status)}" ${
        status === selectedStatus ? "selected" : ""
      }>
        ${escapeHtml(VERSION_STATUS_META[status].label)}
      </option>
    `
  ).join("");
}

function createEmptyInlineMarkup(copy) {
  return `<div class="empty-inline">${escapeHtml(copy)}</div>`;
}

function renderAuth() {
  const isLoggedIn = Boolean(state.auth.user);
  const isBusy = state.auth.loading || state.auth.submitting;

  elements.authCopy.textContent = isLoggedIn
    ? "当前账号会话已建立，项目管理、Kiosk 统计、任务管理和 App 版本管理都会直接连接云端工作区。"
    : "当前未登录，项目管理、Kiosk 统计、任务管理和 App 版本管理会使用浏览器本地游客工作区。登录后将切换到账号云端。";

  elements.authModeButtons.forEach((button) => {
    const isActive = button.dataset.authMode === state.auth.mode;
    button.classList.toggle("is-active", isActive);
    button.disabled = isBusy || isLoggedIn;
    button.setAttribute("aria-pressed", String(isActive));
  });

  elements.authForm.hidden = isLoggedIn;
  elements.authUserCard.hidden = !isLoggedIn;
  elements.authUsernameInput.disabled = isBusy || isLoggedIn;
  elements.authPasswordInput.disabled = isBusy || isLoggedIn;
  elements.authSubmitButton.disabled = isBusy || isLoggedIn;
  elements.authSubmitButton.textContent =
    state.auth.mode === "register" ? "创建账号" : "登录账号";
  elements.refreshSessionButton.disabled = isBusy || !isLoggedIn;
  elements.logoutButton.disabled = isBusy || !isLoggedIn;

  if (isLoggedIn) {
    elements.authUsernameLabel.textContent = state.auth.user.username;
    elements.authWorkspaceCopy.textContent = `当前使用云端账号工作，会话有效至 ${formatDateTime(
      state.auth.session?.expiresAt
    )}。`;
  }

  renderThemeMode();
}

function renderThemeMode() {
  const currentTheme = THEME_META[state.ui.themeMode] || THEME_META.day;
  applyThemeMode(state.ui.themeMode);
  elements.themeModeCopy.textContent = currentTheme.description;

  elements.themeModeButtons.forEach((button) => {
    const isActive = button.dataset.themeMode === state.ui.themeMode;
    button.classList.toggle("is-active", isActive);
    button.setAttribute("aria-pressed", String(isActive));
  });
}

function renderDataTools() {
  const projects = state.workspace.projects;
  const currentProject = state.workspace.currentProject;
  const doneCount = state.workspace.tasks.filter((task) => task.status === "done").length;
  const guestSummary = getMeaningfulGuestSummary(state.guestWorkspace);
  const hasProjects = projects.length > 0;
  const visibleProjectCount = state.workspace.overview?.totals?.projectCount || projects.length;
  const visibleAppCount = state.workspace.overview?.totals?.appCount || 0;
  const visibleVersionCount = state.workspace.overview?.totals?.versionCount || 0;

  elements.projectSelect.innerHTML = buildProjectOptions(projects, "暂无项目");
  elements.projectSelect.value = currentProject?.id || "";
  elements.projectSelect.disabled = !hasProjects;

  elements.projectScopeBadge.textContent = currentProject
    ? `当前项目：${currentProject.name}`
    : "当前无项目";
  elements.dataCurrentProject.textContent = currentProject ? currentProject.name : "未选择";
  elements.dataProjectCount.textContent = String(visibleProjectCount);
  elements.dataTaskCount.textContent = String(state.workspace.tasks.length);
  elements.dataTagCount.textContent = String(state.workspace.tags.length);
  elements.dataAppCount.textContent = String(visibleAppCount);
  elements.dataVersionCount.textContent = String(visibleVersionCount);
  elements.dataDoneCount.textContent = String(doneCount);

  elements.exportJsonButton.disabled = !canExportCurrentProject();
  elements.clearDoneButton.disabled = !currentProject || doneCount === 0;
  elements.clearGuestDataButton.disabled = !guestWorkspaceHasMeaningfulData(
    state.guestWorkspace
  );

  const workspaceMessage =
    state.workspace.mode === "cloud"
      ? "当前正在操作账号云端工作区。"
      : "当前正在操作浏览器本地游客工作区。";
  const guestMessage =
    guestSummary.projectCount > 0 || guestSummary.appCount > 0 || guestSummary.kioskCount > 0
      ? `浏览器本地还保留 ${guestSummary.projectCount} 个游客项目、${guestSummary.taskCount} 项任务、${guestSummary.tagCount} 个标签、${guestSummary.kioskCount} 台 Kiosk，以及 ${guestSummary.appCount} 个 App、${guestSummary.versionCount} 个版本。`
      : "浏览器本地没有额外游客数据，当前仅保留默认本地收件箱占位。";
  const projectMessage = currentProject
    ? `当前项目“${currentProject.name}”可用于导出和清空已完成任务；项目导出会同时带上该项目下的 Kiosk、App 和版本数据。`
    : visibleAppCount > 0
      ? "当前还没有选中项目；如果现在只想查看整体数据，可直接使用工作区导出。"
      : "请先导入 JSON、载入示例数据，或先在项目管理中创建项目。";

  elements.dataGuestSummary.textContent = `${workspaceMessage}${guestMessage}${projectMessage}`;
}

function renderUtilities() {
  const currentProject = state.workspace.currentProject;
  const tasks = sortTasksForDisplay(state.workspace.tasks);
  const pendingTasks = tasks.filter((task) => task.status !== "done");
  const modeLabel = state.workspace.mode === "cloud" ? "云端账号模式" : "游客本地模式";
  const totalKiosks = state.workspace.overview?.totals?.kioskCount || 0;
  const totalApps = state.workspace.overview?.totals?.appCount || 0;
  const totalVersions = state.workspace.overview?.totals?.versionCount || 0;

  elements.utilityWorkspaceMode.textContent = modeLabel;
  elements.utilityCurrentProject.textContent = currentProject ? currentProject.name : "未选择";
  elements.utilityTaskCount.textContent = String(tasks.length);
  elements.utilityPendingTaskCount.textContent = String(pendingTasks.length);

  elements.refreshWorkspaceButton.disabled = state.auth.loading || state.auth.submitting;
  elements.openCurrentProjectDetailsButton.disabled = !currentProject;
  elements.exportWorkspaceButton.disabled =
    state.workspace.projects.length === 0 && totalApps === 0;
  elements.copyWorkspaceSummaryButton.disabled =
    state.workspace.projects.length === 0 && totalApps === 0;
  elements.copyProjectSummaryButton.disabled = !currentProject;
  elements.copyPendingTaskListButton.disabled = !currentProject || pendingTasks.length === 0;
  elements.copyProjectJsonButton.disabled = !currentProject;

  elements.utilityContextCopy.textContent = currentProject
    ? `当前工作在${modeLabel}下，项目“${currentProject.name}”共有 ${tasks.length} 项任务，其中 ${pendingTasks.length} 项仍未完成；整个工作区另外还包含 ${totalKiosks} 台 Kiosk、${totalApps} 个 App、${totalVersions} 个版本。这里可以直接执行高频快捷操作。`
    : `当前工作在${modeLabel}下，但还没有选中项目。当前工作区仍包含 ${totalKiosks} 台 Kiosk、${totalApps} 个 App、${totalVersions} 个版本，可以先去任务详情、项目管理或版本详情建立内容，再回来使用复制和导出工具。`;
}

function renderSyncPanel() {
  const guestSummary = getMeaningfulGuestSummary(state.guestWorkspace);
  const hasGuestData = guestWorkspaceHasMeaningfulData(state.guestWorkspace);

  if (!state.auth.user) {
    elements.syncMessage.textContent =
      "登录后可以把浏览器中的游客模式数据显式导入当前账号。";
    elements.importGuestButton.disabled = true;
    return;
  }

  if (!hasGuestData) {
    elements.syncMessage.textContent = "当前没有可导入当前账号的游客数据。";
    elements.importGuestButton.disabled = true;
    return;
  }

  if (state.guestWorkspace.importedUsers.includes(String(state.auth.user.id))) {
    elements.syncMessage.textContent =
      "当前浏览器中的游客数据已导入过这个账号。如需重新导入，请先更新本地数据。";
    elements.importGuestButton.disabled = true;
    return;
  }

  elements.syncMessage.textContent = `检测到浏览器本地仍有 ${guestSummary.projectCount} 个游客项目、${guestSummary.taskCount} 项任务、${guestSummary.tagCount} 个标签、${guestSummary.kioskCount} 台 Kiosk，以及 ${guestSummary.appCount} 个 App、${guestSummary.versionCount} 个版本。导入会显式写入当前账号，不会自动覆盖本地副本。`;
  elements.importGuestButton.disabled = false;
}

function syncEditorStateAfterWorkspaceSync(options = {}) {
  const { preserveProjectCreateMode = false } = options;

  if (preserveProjectCreateMode) {
    state.ui.projectFormMode = "create";
    state.ui.editingProjectId = null;
  } else if (state.workspace.currentProject) {
    state.ui.projectFormMode = "edit";
    state.ui.editingProjectId = state.workspace.currentProject.id;
  } else {
    state.ui.projectFormMode = "create";
    state.ui.editingProjectId = null;
  }

  if (
    state.ui.editingTaskId &&
    !state.workspace.tasks.some((task) => task.id === state.ui.editingTaskId)
  ) {
    state.ui.editingTaskId = null;
  }

  if (
    state.ui.editingTagId &&
    !state.workspace.tags.some((tag) => tag.id === state.ui.editingTagId)
  ) {
    state.ui.editingTagId = null;
  }

  state.ui.selectedTaskIds = state.ui.selectedTaskIds.filter((taskId) =>
    state.workspace.tasks.some((task) => task.id === taskId)
  );

  if (
    state.ui.detailTagFilter !== "all" &&
    !state.workspace.tags.some((tag) => tag.id === state.ui.detailTagFilter)
  ) {
    state.ui.detailTagFilter = "all";
  }
}

function syncAppEditorStateAfterWorkspaceSync(options = {}) {
  const { preserveAppCreateMode = false } = options;

  if (preserveAppCreateMode) {
    state.ui.appFormMode = "create";
    state.ui.editingAppId = null;
  } else if (state.appWorkspace.currentApp) {
    state.ui.appFormMode = "edit";
    state.ui.editingAppId = state.appWorkspace.currentApp.id;
  } else {
    state.ui.appFormMode = "create";
    state.ui.editingAppId = null;
  }

  if (
    state.ui.editingVersionId &&
    !state.appWorkspace.versions.some((version) => version.id === state.ui.editingVersionId)
  ) {
    state.ui.editingVersionId = null;
  }

  state.ui.selectedVersionIds = state.ui.selectedVersionIds.filter((versionId) =>
    state.appWorkspace.versions.some((version) => version.id === versionId)
  );
}

function buildGuestWorkspaceOverview(workspace) {
  const normalizedWorkspace = normalizeGuestWorkspace(workspace);
  const projects = sortProjects(
    normalizedWorkspace.projects.filter((project) =>
      guestProjectHasMeaningfulData(normalizedWorkspace, project.id)
    )
  );
  const tasksByProjectId = new Map();

  normalizedWorkspace.tasks.forEach((task) => {
    const collection = tasksByProjectId.get(task.projectId) || [];
    collection.push(task);
    tasksByProjectId.set(task.projectId, collection);
  });

  const totals = createEmptyStatusSummary();
  totals.appCount = 0;
  totals.versionCount = 0;
  totals.kioskCount = 0;
  const projectSummaries = projects.map((project) => {
    const projectTasks = tasksByProjectId.get(project.id) || [];
    const projectApps = normalizedWorkspace.apps.filter((app) => app.projectId === project.id);
    const projectKiosks = normalizedWorkspace.kiosks.filter(
      (kiosk) => kiosk.projectId === project.id
    );
    const summary = summarizeTasks(projectTasks);
    const versionCount = normalizedWorkspace.versions.filter((version) =>
      projectApps.some((app) => app.id === version.appId)
    ).length;

    totals.taskCount += summary.taskCount;
    totals.todoCount += summary.todoCount;
    totals.doingCount += summary.doingCount;
    totals.reviewCount += summary.reviewCount;
    totals.doneCount += summary.doneCount;
    totals.appCount += projectApps.length;
    totals.versionCount += versionCount;
    totals.kioskCount += projectKiosks.length;

    return {
      ...project,
      ...summary,
      appCount: projectApps.length,
      versionCount,
      kioskCount: projectKiosks.length,
      recentTasks: sortTasksByRecent(projectTasks).slice(0, 3).map((task) => ({
        id: task.id,
        title: task.title,
        status: task.status,
        priority: task.priority,
        createdAt: task.createdAt,
        updatedAt: task.updatedAt,
      })),
    };
  });

  return {
    totals: {
      ...totals,
      projectCount: projects.length,
      activeProjectCount: projects.filter((project) => !project.archived).length,
      archivedProjectCount: projects.filter((project) => project.archived).length,
    },
    projects: projectSummaries,
  };
}

function buildGuestAppWorkspaceOverview(workspace, projectId) {
  const normalizedWorkspace = normalizeGuestWorkspace(workspace);
  const apps = sortProjects(
    normalizedWorkspace.apps.filter((app) => app.projectId === projectId)
  );
  const versionsByAppId = new Map();

  normalizedWorkspace.versions.forEach((version) => {
    const collection = versionsByAppId.get(version.appId) || [];
    collection.push(version);
    versionsByAppId.set(version.appId, collection);
  });

  const totals = createEmptyAppStatusSummary();
  const appSummaries = apps.map((app) => {
    const appVersions = versionsByAppId.get(app.id) || [];
    const summary = summarizeVersions(appVersions);

    totals.versionCount += summary.versionCount;
    totals.todoCount += summary.todoCount;
    totals.doingCount += summary.doingCount;
    totals.reviewCount += summary.reviewCount;
    totals.doneCount += summary.doneCount;

    return {
      ...app,
      ...summary,
      recentVersions: sortVersionsByRecent(appVersions).slice(0, 3).map((version) => ({
        id: version.id,
        versionName: version.versionName,
        buildNumber: version.buildNumber,
        resourceVersion: version.resourceVersion,
        channel: version.channel,
        status: version.status,
        priority: version.priority,
        createdAt: version.createdAt,
        updatedAt: version.updatedAt,
      })),
    };
  });

  return {
    totals: {
      ...totals,
      appCount: apps.length,
      activeAppCount: apps.filter((app) => !app.archived).length,
      archivedAppCount: apps.filter((app) => app.archived).length,
    },
    apps: appSummaries,
  };
}

function normalizeOverviewPayload(payload) {
  if (!payload || typeof payload !== "object") {
    return createEmptyOverview();
  }

  const totals = payload.totals && typeof payload.totals === "object" ? payload.totals : {};
  const projects = Array.isArray(payload.projects)
    ? sortProjects(
        payload.projects.map((project) => ({
          ...project,
          archived: Boolean(project.archived),
          taskCount: Number(project.taskCount) || 0,
          appCount: Number(project.appCount) || 0,
          versionCount: Number(project.versionCount) || 0,
          kioskCount: Number(project.kioskCount) || 0,
          todoCount: Number(project.todoCount) || 0,
          doingCount: Number(project.doingCount) || 0,
          reviewCount: Number(project.reviewCount) || 0,
          doneCount: Number(project.doneCount) || 0,
          recentTasks: Array.isArray(project.recentTasks) ? project.recentTasks : [],
        }))
      )
    : [];

  return {
    totals: {
      projectCount: Number(totals.projectCount) || projects.length,
      activeProjectCount: Number(totals.activeProjectCount) || 0,
      archivedProjectCount: Number(totals.archivedProjectCount) || 0,
      taskCount: Number(totals.taskCount) || 0,
      appCount: Number(totals.appCount) || 0,
      versionCount: Number(totals.versionCount) || 0,
      kioskCount: Number(totals.kioskCount) || 0,
      todoCount: Number(totals.todoCount) || 0,
      doingCount: Number(totals.doingCount) || 0,
      reviewCount: Number(totals.reviewCount) || 0,
      doneCount: Number(totals.doneCount) || 0,
    },
    projects,
  };
}

function createEmptyOverview() {
  return {
    totals: {
      projectCount: 0,
      activeProjectCount: 0,
      archivedProjectCount: 0,
      taskCount: 0,
      appCount: 0,
      versionCount: 0,
      kioskCount: 0,
      todoCount: 0,
      doingCount: 0,
      reviewCount: 0,
      doneCount: 0,
    },
    projects: [],
  };
}

function normalizeAppOverviewPayload(payload) {
  if (!payload || typeof payload !== "object") {
    return createEmptyAppOverview();
  }

  const totals = payload.totals && typeof payload.totals === "object" ? payload.totals : {};
  const apps = Array.isArray(payload.apps)
    ? sortProjects(
        payload.apps.map((app) => ({
          ...app,
          archived: Boolean(app.archived),
          versionCount: Number(app.versionCount) || 0,
          todoCount: Number(app.todoCount) || 0,
          doingCount: Number(app.doingCount) || 0,
          reviewCount: Number(app.reviewCount) || 0,
          doneCount: Number(app.doneCount) || 0,
          recentVersions: Array.isArray(app.recentVersions) ? app.recentVersions : [],
        }))
      )
    : [];

  return {
    totals: {
      appCount: Number(totals.appCount) || apps.length,
      activeAppCount: Number(totals.activeAppCount) || 0,
      archivedAppCount: Number(totals.archivedAppCount) || 0,
      versionCount: Number(totals.versionCount) || 0,
      todoCount: Number(totals.todoCount) || 0,
      doingCount: Number(totals.doingCount) || 0,
      reviewCount: Number(totals.reviewCount) || 0,
      doneCount: Number(totals.doneCount) || 0,
    },
    apps,
  };
}

function createEmptyAppOverview() {
  return {
    totals: {
      appCount: 0,
      activeAppCount: 0,
      archivedAppCount: 0,
      versionCount: 0,
      todoCount: 0,
      doingCount: 0,
      reviewCount: 0,
      doneCount: 0,
    },
    apps: [],
  };
}

async function buildWorkspaceExportPayload() {
  if (state.workspace.mode !== "cloud") {
    return buildGuestWorkspaceExportPayload(state.guestWorkspace);
  }

  const projectPayloads = await Promise.all(
    state.workspace.projects.map((project) => buildProjectExportPayload(project.id))
  );

  return {
    source: "task-atlas",
    version: 4,
    scope: "workspace",
    exportedAt: new Date().toISOString(),
    projects: projectPayloads.map((payload) => ({
      project: payload.project || {},
      tags: Array.isArray(payload.tags) ? payload.tags : [],
      kiosks: Array.isArray(payload.kiosks) ? payload.kiosks : [],
      tasks: Array.isArray(payload.tasks) ? payload.tasks : [],
      apps: Array.isArray(payload.apps) ? payload.apps : [],
    })),
  };
}

async function buildProjectExportPayload(projectId) {
  if (!projectId) {
    throw new Error("项目不存在");
  }

  if (state.workspace.mode === "cloud") {
    return apiRequest(`/api/projects/${projectId}/export`);
  }

  return buildGuestProjectExportPayload(state.guestWorkspace, projectId);
}

async function buildAppExportPayload(appId) {
  if (!appId) {
    throw new Error("App 不存在");
  }

  if (state.appWorkspace.mode === "cloud") {
    const currentProjectId = state.workspace.currentProjectId;
    if (!currentProjectId) {
      throw new Error("项目不存在");
    }
    return apiRequest(`/api/projects/${currentProjectId}/apps/${appId}/export`);
  }

  return buildGuestAppExportPayload(state.guestWorkspace, appId);
}

async function importPayloadToCloud(payload) {
  const containsProjectData = payloadContainsProjectData(payload);
  const containsAppData = payloadContainsAppData(payload);

  if (!containsProjectData && !containsAppData) {
    throw new Error("暂不支持当前 JSON 结构");
  }

  if (containsProjectData) {
    const projectResult = await apiRequest("/api/import/json", {
      method: "POST",
      body: payload,
    });

    return {
      importedProject: projectResult.importedProjects?.at(-1) || null,
      importedApp: null,
      importedProjectCount: Number(projectResult.importedCount) || 0,
      importedAppCount: Number(projectResult.importedAppCount) || 0,
      importedKioskCount: Number(projectResult.importedKioskCount) || 0,
    };
  }

  const appResult = await apiRequest("/api/apps/import/json", {
    method: "POST",
    body: payload,
  });

  return {
    importedProject: appResult.importedProjects?.at(-1) || null,
    importedApp: appResult.importedApps?.at(-1) || null,
    importedProjectCount: Number(appResult.importedProjects?.length) || 0,
    importedAppCount: Number(appResult.importedCount) || 0,
    importedKioskCount: 0,
  };
}

function payloadContainsProjectData(payload) {
  if (!payload || typeof payload !== "object") {
    return false;
  }

  if (payload.scope === "workspace") {
    return Array.isArray(payload.projects) && payload.projects.length > 0;
  }

  if (payload.scope === "project") {
    return Boolean(payload.project);
  }

  if (!payload.scope && payload.project) {
    return (
      Array.isArray(payload.tasks) ||
      Array.isArray(payload.tags) ||
      Array.isArray(payload.kiosks) ||
      Array.isArray(payload.apps)
    );
  }

  return false;
}

function payloadContainsAppData(payload) {
  if (!payload || typeof payload !== "object") {
    return false;
  }

  if (payload.scope === "workspace") {
    return (
      (Array.isArray(payload.apps) && payload.apps.length > 0) ||
      (Array.isArray(payload.projects) &&
        payload.projects.some((project) => Array.isArray(project.apps) && project.apps.length > 0))
    );
  }

  if (payload.scope === "app") {
    return Boolean(payload.app);
  }

  if (payload.scope === "project") {
    return Array.isArray(payload.apps) && payload.apps.length > 0;
  }

  if (!payload.scope && payload.app) {
    return true;
  }

  if (!payload.scope && payload.project) {
    return Array.isArray(payload.apps) && payload.apps.length > 0;
  }

  return Boolean(payload.app);
}

function buildImportResultMessage(result) {
  const segments = [];

  if (result.importedProjectCount) {
    segments.push(`已导入 ${result.importedProjectCount} 个项目`);
  }

  if (result.importedAppCount) {
    segments.push(`已导入 ${result.importedAppCount} 个 App`);
  }

  if (result.importedKioskCount) {
    segments.push(`已导入 ${result.importedKioskCount} 台 Kiosk`);
  }

  return segments.join("，") || "导入完成";
}

function buildWorkspaceSummaryText() {
  const overview = state.workspace.overview || createEmptyOverview();
  const totals = overview.totals || createEmptyOverview().totals;
  const currentProject = state.workspace.currentProject;
  const currentApp = state.appWorkspace.currentApp;
  const projects = Array.isArray(overview.projects) ? overview.projects : [];
  const lines = [
    "Task Atlas 工作区摘要",
    `生成时间：${formatDateTime(new Date().toISOString())}`,
    `工作模式：${state.workspace.mode === "cloud" ? "云端账号模式" : "游客本地模式"}`,
    `当前项目：${currentProject ? currentProject.name : "未选择"}`,
    `当前 App：${currentApp ? currentApp.name : "未选择"}`,
    `项目总数：${totals.projectCount || 0}`,
    `活跃项目：${totals.activeProjectCount || 0}`,
    `任务总数：${totals.taskCount || 0}`,
    `状态分布：未开始 ${totals.todoCount || 0} / 进行中 ${totals.doingCount || 0} / 待验收 ${
      totals.reviewCount || 0
    } / 已完成 ${totals.doneCount || 0}`,
    `App 总数：${totals.appCount || 0}`,
    `版本总数：${totals.versionCount || 0}`,
    `Kiosk 总数：${totals.kioskCount || 0}`,
  ];

  if (currentProject) {
    lines.push(`当前项目标签：${state.workspace.tags.length}`);
    lines.push(`当前项目任务：${state.workspace.tasks.length}`);
  }

  if (projects.length) {
    lines.push("", "项目清单：");
    projects.forEach((project, index) => {
      lines.push(
        `${index + 1}. ${project.name}${project.archived ? " [已归档]" : ""}：${
          project.taskCount
        } 项任务，${project.appCount || 0} 个 App，${project.versionCount || 0} 个版本，${
          project.kioskCount || 0
        } 台 Kiosk（未开始 ${project.todoCount} / 进行中 ${project.doingCount} / 待验收 ${
          project.reviewCount
        } / 已完成 ${project.doneCount}）`
      );
    });
  }

  return lines.join("\n");
}

function buildCurrentProjectSummaryText() {
  const currentProject = state.workspace.currentProject;
  if (!currentProject) {
    throw new Error("项目不存在");
  }

  const tasks = sortTasksForDisplay(state.workspace.tasks);
  const summary = summarizeTasks(tasks);
  const projectApps = state.appWorkspace.projectId === currentProject.id ? state.appWorkspace.apps : [];
  const projectKiosks = sortKiosksForDisplay(state.workspace.kiosks || []);
  const projectVersions =
    state.workspace.mode === "cloud"
      ? state.appWorkspace.overview?.totals?.versionCount || 0
      : projectApps.reduce(
          (count, app) =>
            count +
            state.guestWorkspace.versions.filter((version) => version.appId === app.id).length,
          0
        );
  const lines = [
    `项目摘要：${currentProject.name}`,
    `生成时间：${formatDateTime(new Date().toISOString())}`,
    `项目说明：${currentProject.description || "这个项目暂时还没有补充说明。"}`,
    `项目状态：${currentProject.archived ? "已归档" : "活跃"}`,
    `标签数量：${state.workspace.tags.length}`,
    `任务总数：${summary.taskCount}`,
    `App 数量：${projectApps.length}`,
    `版本数量：${projectVersions}`,
    `Kiosk 数量：${projectKiosks.length}`,
    `状态分布：未开始 ${summary.todoCount} / 进行中 ${summary.doingCount} / 待验收 ${summary.reviewCount} / 已完成 ${summary.doneCount}`,
    `项目说明补充：${buildProjectMetaCopy(currentProject, tasks)}`,
  ];

  return lines.join("\n");
}

function buildPendingTaskListText() {
  const currentProject = state.workspace.currentProject;
  if (!currentProject) {
    throw new Error("项目不存在");
  }

  const pendingTasks = sortTasksForDisplay(state.workspace.tasks).filter(
    (task) => task.status !== "done"
  );

  if (!pendingTasks.length) {
    throw new Error("当前项目没有未完成任务");
  }

  const lines = [
    `项目待办清单：${currentProject.name}`,
    `生成时间：${formatDateTime(new Date().toISOString())}`,
    "",
    ...pendingTasks.map((task) => {
      const parts = [
        STATUS_META[task.status]?.label || "未开始",
        `优先级${PRIORITY_META[task.priority]?.label || "中"}`,
      ];

      if (task.assignee) {
        parts.push(`负责人${task.assignee}`);
      }

      if (task.dueDate) {
        parts.push(`截止${formatDateOnly(task.dueDate)}`);
      }

      return `- [ ] ${task.title}（${parts.join(" / ")}）`;
    }),
  ];

  return lines.join("\n");
}

function buildVersionSummaryText(version) {
  if (!version) {
    throw new Error("版本不存在");
  }

  const currentProject = state.workspace.currentProject;
  const currentApp = state.appWorkspace.currentApp;
  const lines = [
    `版本信息：${buildVersionDisplayName(version)}`,
    `所属项目：${currentProject?.name || "未选择"}`,
    `所属 App：${currentApp?.name || "未选择"}`,
    `构建号：${version.buildNumber || "未填写"}`,
    `资源版本：${version.resourceVersion || "未填写"}`,
    `状态：${VERSION_STATUS_META[version.status]?.label || "待规划"}`,
    `优先级：${PRIORITY_META[version.priority]?.label || "中"}`,
    `发布渠道：${VERSION_CHANNEL_META[version.channel]?.label || "正式发布"}`,
    `负责人：${version.owner || "未填写"}`,
  ];

  if (version.releaseDate) {
    lines.push(`计划发布日期：${formatDateOnly(version.releaseDate)}`);
  }

  if (version.publishedDate) {
    lines.push(`实际发布日期：${formatDateOnly(version.publishedDate)}`);
  }

  if (version.description) {
    lines.push(`版本说明：${version.description}`);
  }

  if (version.notes) {
    lines.push(`发布备注：${version.notes}`);
  }

  return lines.join("\n");
}

function buildVersionDisplayName(version) {
  if (!version) {
    return "未命名版本";
  }

  const versionName = String(version.versionName || "").trim();
  if (versionName) {
    return versionName;
  }

  const resourceVersion = String(version.resourceVersion || "").trim();
  if (resourceVersion) {
    return `资源 ${resourceVersion}`;
  }

  const buildNumber = String(version.buildNumber || "").trim();
  if (buildNumber) {
    return `构建 ${buildNumber}`;
  }

  return "未命名版本";
}

function createEmptyStatusSummary() {
  return {
    taskCount: 0,
    todoCount: 0,
    doingCount: 0,
    reviewCount: 0,
    doneCount: 0,
  };
}

function createEmptyAppStatusSummary() {
  return {
    versionCount: 0,
    todoCount: 0,
    doingCount: 0,
    reviewCount: 0,
    doneCount: 0,
  };
}

function createEmptyKioskSummary() {
  return {
    kioskCount: 0,
    regionCount: 0,
    usbCount: 0,
    bluetoothCount: 0,
    wifiCount: 0,
  };
}

function summarizeTasks(tasks) {
  return tasks.reduce((summary, task) => {
    summary.taskCount += 1;

    if (task.status === "todo") {
      summary.todoCount += 1;
    } else if (task.status === "doing") {
      summary.doingCount += 1;
    } else if (task.status === "review") {
      summary.reviewCount += 1;
    } else if (task.status === "done") {
      summary.doneCount += 1;
    }

    return summary;
  }, createEmptyStatusSummary());
}

function summarizeVersions(versions) {
  return versions.reduce((summary, version) => {
    summary.versionCount += 1;

    if (version.status === "todo") {
      summary.todoCount += 1;
    } else if (version.status === "doing") {
      summary.doingCount += 1;
    } else if (version.status === "review") {
      summary.reviewCount += 1;
    } else if (version.status === "done") {
      summary.doneCount += 1;
    }

    return summary;
  }, createEmptyAppStatusSummary());
}

function summarizeKiosks(kiosks) {
  const regions = new Set();

  return kiosks.reduce((summary, kiosk) => {
    summary.kioskCount += 1;
    if (kiosk.region) {
      regions.add(kiosk.region);
      summary.regionCount = regions.size;
    }

    if (kiosk.printerConnection === "bluetooth") {
      summary.bluetoothCount += 1;
    } else if (kiosk.printerConnection === "wifi") {
      summary.wifiCount += 1;
    } else {
      summary.usbCount += 1;
    }

    return summary;
  }, createEmptyKioskSummary());
}

function buildProjectMetaCopy(project, tasks) {
  const doneCount = tasks.filter((task) => task.status === "done").length;
  const doingCount = tasks.filter((task) => task.status === "doing").length;
  const description = project.description
    ? `${project.description} `
    : "这个项目暂时还没有补充说明。 ";

  return `${description}创建于 ${formatDateTime(project.createdAt)}，当前共有 ${tasks.length} 项任务，其中 ${doingCount} 项进行中、${doneCount} 项已完成。`;
}

function buildAppMetaCopy(app, versions) {
  const releasedCount = versions.filter((version) => version.status === "done").length;
  const workingCount = versions.filter((version) => version.status === "doing").length;
  const description = app.description
    ? `${app.description} `
    : "这个 App 暂时还没有补充说明。 ";

  return `${description}创建于 ${formatDateTime(app.createdAt)}，当前共有 ${versions.length} 个版本，其中 ${workingCount} 个开发中、${releasedCount} 个已发布。`;
}

function syncCompletedDateField(status) {
  if (elements.statusInput.disabled) {
    elements.completedDateInput.disabled = true;
    return;
  }

  const isDone = status === "done";
  elements.completedDateInput.disabled = !isDone;
  if (isDone) {
    if (!elements.completedDateInput.value) {
      elements.completedDateInput.value = todayString();
    }
    return;
  }

  elements.completedDateInput.value = "";
}

function syncPublishedDateField(status) {
  if (elements.versionStatusInput.disabled) {
    elements.publishedDateInput.disabled = true;
    return;
  }

  const isDone = status === "done";
  elements.publishedDateInput.disabled = !isDone;
  if (isDone) {
    if (!elements.publishedDateInput.value) {
      elements.publishedDateInput.value = todayString();
    }
    return;
  }

  elements.publishedDateInput.value = "";
}

function getSelectedTaskTagIds() {
  return [...elements.taskTagPicker.querySelectorAll("[data-tag-id][aria-pressed='true']")].map(
    (button) => String(button.dataset.tagId)
  );
}

function parseSubtasksInput(value) {
  return String(value || "")
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const matched = line.match(/^\[(x|X|\s)?\]\s*(.+)$/);
      if (matched) {
        return {
          title: matched[2].trim(),
          completed: matched[1]?.toLowerCase() === "x",
        };
      }

      return {
        title: line,
        completed: false,
      };
    })
    .filter((subtask) => subtask.title);
}

function formatSubtasksForInput(subtasks) {
  return subtasks
    .map((subtask) => `${subtask.completed ? "[x]" : "[ ]"} ${subtask.title}`)
    .join("\n");
}

function buildProjectOptions(projects, emptyLabel) {
  if (!projects.length) {
    return `<option value="">${escapeHtml(emptyLabel)}</option>`;
  }

  return projects
    .map(
      (project) => `
        <option value="${escapeHtml(project.id)}">
          ${escapeHtml(project.name)}${project.archived ? " (已归档)" : ""}
        </option>
      `
    )
    .join("");
}

function buildScheduleProjectOptions(projects, projectIdsWithPendingTasks = new Set()) {
  if (!projects.length) {
    return `<option value="">${escapeHtml("暂无项目")}</option>`;
  }

  const allProjectsLabel = projectIdsWithPendingTasks.size ? "● 所有项目" : "所有项目";

  return [
    `<option value="${escapeHtml(SCHEDULE_ALL_PROJECTS_VALUE)}">${escapeHtml(
      allProjectsLabel
    )}</option>`,
    ...projects.map((project) => {
      const hasPendingTasks = projectIdsWithPendingTasks.has(project.id);
      const projectLabel = `${hasPendingTasks ? "● " : ""}${project.name}${
        project.archived ? " (已归档)" : ""
      }`;

      return `
        <option value="${escapeHtml(project.id)}">
          ${escapeHtml(projectLabel)}
        </option>
      `;
    }),
  ].join("");
}

function buildStatusOptions(selectedStatus) {
  return STATUS_ORDER.map(
    (status) => `
      <option value="${escapeHtml(status)}" ${
        status === selectedStatus ? "selected" : ""
      }>
        ${escapeHtml(STATUS_META[status].label)}
      </option>
    `
  ).join("");
}

function createEmptyStateMarkup(title, copy) {
  return `
    <div class="empty-state">
      <div>
        <h4>${escapeHtml(title)}</h4>
        <p>${escapeHtml(copy)}</p>
      </div>
    </div>
  `;
}

function setFormDisabled(form, disabled) {
  form.querySelectorAll("input, textarea, select, button").forEach((control) => {
    if (control.type === "hidden") {
      return;
    }
    control.disabled = disabled;
  });
}

function createGuestAppRecord(projectId, payload) {
  const now = new Date().toISOString();
  return {
    id: createId(),
    projectId,
    name: String(payload.name || "未命名 App").trim() || "未命名 App",
    description: String(payload.description || "").trim(),
    color: normalizeHexColor(payload.color, "#245a73"),
    platform: APP_PLATFORM_META[payload.platform] ? payload.platform : "ios",
    bundleId: String(payload.bundleId || "").trim(),
    archived: false,
    createdAt: now,
    updatedAt: now,
  };
}

function createGuestProjectRecord(payload) {
  const now = new Date().toISOString();
  return {
    id: createId(),
    name: String(payload.name || DEFAULT_PROJECT_NAME).trim() || DEFAULT_PROJECT_NAME,
    description: String(payload.description || "").trim(),
    color: normalizeHexColor(payload.color, "#c16b39"),
    archived: false,
    createdAt: now,
    updatedAt: now,
  };
}

function createGuestTaskRecord(projectId, payload) {
  const now = new Date().toISOString();
  const status = STATUS_META[payload.status] ? payload.status : "todo";
  return {
    id: createId(),
    projectId,
    title: String(payload.title || "").trim(),
    description: String(payload.description || "").trim(),
    notes: String(payload.notes || "").trim(),
    assignee: String(payload.assignee || "").trim(),
    status,
    priority: PRIORITY_META[payload.priority] ? payload.priority : "medium",
    startDate: normalizeLocalDueDate(payload.startDate),
    dueDate: normalizeLocalDueDate(payload.dueDate),
    completedDate: resolveGuestCompletedDateForStatus(
      status,
      normalizeLocalDueDate(payload.completedDate),
      {
        previousStatus: "",
        previousCompletedDate: "",
      }
    ),
    tagIds: Array.isArray(payload.tagIds) ? payload.tagIds.map(String) : [],
    subtasks: Array.isArray(payload.subtasks)
      ? payload.subtasks.map((subtask) => ({
          id: createId(),
          title: String(subtask.title || "").trim(),
          completed: Boolean(subtask.completed),
          createdAt: now,
          updatedAt: now,
        }))
      : [],
    createdAt: now,
    updatedAt: now,
  };
}

function createGuestKioskRecord(projectId, payload) {
  const now = new Date().toISOString();
  return {
    id: createId(),
    projectId,
    region: String(payload.region || "").trim(),
    location: String(payload.location || "").trim(),
    printerConnection: KIOSK_PRINTER_CONNECTION_META[payload.printerConnection]
      ? payload.printerConnection
      : "usb",
    printerModel: String(payload.printerModel || "").trim(),
    printerNotes: String(payload.printerNotes || "").trim(),
    kioskPlatform: String(payload.kioskPlatform || "").trim(),
    remotePlatform: String(payload.remotePlatform || "").trim(),
    remoteCode: String(payload.remoteCode || "").trim(),
    activeAppId: String(payload.activeAppId || "").trim(),
    activeVersionId: String(payload.activeVersionId || "").trim(),
    notes: String(payload.notes || "").trim(),
    createdAt: now,
    updatedAt: now,
  };
}

function createGuestVersionRecord(appId, payload) {
  const now = new Date().toISOString();
  const status = VERSION_STATUS_META[payload.status] ? payload.status : "todo";
  return {
    id: createId(),
    appId,
    versionName: String(payload.versionName || "").trim(),
    buildNumber: String(payload.buildNumber || "").trim(),
    resourceVersion: String(payload.resourceVersion || "").trim(),
    description: String(payload.description || "").trim(),
    notes: String(payload.notes || "").trim(),
    owner: String(payload.owner || "").trim(),
    channel: VERSION_CHANNEL_META[payload.channel] ? payload.channel : "stable",
    status,
    priority: PRIORITY_META[payload.priority] ? payload.priority : "medium",
    plannedDate: normalizeLocalDueDate(payload.plannedDate),
    releaseDate: normalizeLocalDueDate(payload.releaseDate),
    publishedDate: resolveGuestPublishedDateForStatus(
      status,
      normalizeLocalDueDate(payload.publishedDate),
      {
        previousStatus: "",
        previousPublishedDate: "",
      }
    ),
    createdAt: now,
    updatedAt: now,
  };
}

function buildGuestSubtasksForStorage(subtasks, previousSubtasks = [], timestamp) {
  return Array.isArray(subtasks)
    ? subtasks.map((subtask, index) => ({
        id: String(previousSubtasks[index]?.id || createId()),
        title: String(subtask.title || "").trim(),
        completed: Boolean(subtask.completed),
        createdAt: previousSubtasks[index]?.createdAt || timestamp,
        updatedAt: timestamp,
      }))
    : [];
}

function resolveGuestCompletedDateForStatus(status, completedDate, options = {}) {
  const {
    previousStatus = "",
    previousCompletedDate = "",
    useTodayIfEmpty = true,
  } = options;
  if (status !== "done") {
    return "";
  }

  const normalizedCompletedDate = normalizeLocalDueDate(completedDate);
  if (normalizedCompletedDate) {
    return normalizedCompletedDate;
  }

  if (previousCompletedDate) {
    return previousCompletedDate;
  }

  if (useTodayIfEmpty && previousStatus !== "done") {
    return todayString();
  }

  return "";
}

function resolveGuestPublishedDateForStatus(status, publishedDate, options = {}) {
  const {
    previousStatus = "",
    previousPublishedDate = "",
    useTodayIfEmpty = true,
  } = options;
  if (status !== "done") {
    return "";
  }

  const normalizedPublishedDate = normalizeLocalDueDate(publishedDate);
  if (normalizedPublishedDate) {
    return normalizedPublishedDate;
  }

  if (previousPublishedDate) {
    return previousPublishedDate;
  }

  if (useTodayIfEmpty && previousStatus !== "done") {
    return todayString();
  }

  return "";
}

function assertGuestTagNameUnique(projectId, name, currentTagId = null) {
  const normalizedName = String(name || "").trim().toLowerCase();
  const duplicated = state.guestWorkspace.tags.find(
    (tag) =>
      tag.projectId === projectId &&
      tag.id !== currentTagId &&
      tag.name.trim().toLowerCase() === normalizedName
  );

  if (duplicated) {
    throw new Error("同一项目下标签名不能重复");
  }
}

function touchGuestProject(workspace, projectId, timestamp) {
  if (!projectId) {
    return;
  }

  workspace.projects = workspace.projects.map((project) =>
    project.id === projectId
      ? {
          ...project,
          updatedAt: timestamp,
        }
      : project
  );
}

function touchGuestApp(workspace, appId, timestamp) {
  if (!appId) {
    return;
  }

  const app = workspace.apps.find((item) => item.id === appId);

  workspace.apps = workspace.apps.map((app) =>
    app.id === appId
      ? {
          ...app,
          updatedAt: timestamp,
        }
      : app
  );

  if (app?.projectId) {
    touchGuestProject(workspace, app.projectId, timestamp);
  }
}

function sortTags(tags) {
  return [...tags].sort(
    (left, right) => toTimestamp(left.createdAt) - toTimestamp(right.createdAt)
  );
}

function sortTasksByRecent(tasks) {
  return [...tasks].sort(
    (left, right) => toTimestamp(right.updatedAt) - toTimestamp(left.updatedAt)
  );
}

function sortTasksForDisplay(tasks) {
  return [...tasks].sort((left, right) => {
    const priorityDiff =
      (PRIORITY_META[right.priority]?.rank || 0) - (PRIORITY_META[left.priority]?.rank || 0);
    if (priorityDiff !== 0) {
      return priorityDiff;
    }
    return toTimestamp(right.updatedAt) - toTimestamp(left.updatedAt);
  });
}

function sortKiosksForDisplay(kiosks) {
  return [...kiosks].sort(
    (left, right) => toTimestamp(right.updatedAt) - toTimestamp(left.updatedAt)
  );
}

function sortVersionsByRecent(versions) {
  return [...versions].sort(
    (left, right) => toTimestamp(right.updatedAt) - toTimestamp(left.updatedAt)
  );
}

function sortVersionsForDisplay(versions) {
  return [...versions].sort((left, right) => {
    const priorityDiff =
      (PRIORITY_META[right.priority]?.rank || 0) - (PRIORITY_META[left.priority]?.rank || 0);
    if (priorityDiff !== 0) {
      return priorityDiff;
    }
    return toTimestamp(right.updatedAt) - toTimestamp(left.updatedAt);
  });
}

function canExportCurrentProject() {
  if (!state.workspace.currentProject) {
    return false;
  }

  if (state.workspace.mode === "cloud") {
    return true;
  }

  return guestProjectHasMeaningfulData(state.guestWorkspace, state.workspace.currentProject.id);
}

function getMeaningfulGuestSummary(workspace) {
  if (!guestWorkspaceHasMeaningfulData(workspace)) {
    return {
      projectCount: 0,
      taskCount: 0,
      tagCount: 0,
      kioskCount: 0,
      appCount: 0,
      versionCount: 0,
    };
  }

  const meaningfulProjects = workspace.projects.filter((project) =>
    guestProjectHasMeaningfulData(workspace, project.id)
  );

  return {
    projectCount: meaningfulProjects.length,
    taskCount: workspace.tasks.length,
    tagCount: workspace.tags.length,
    kioskCount: workspace.kiosks.filter((kiosk) =>
      meaningfulProjects.some((project) => project.id === kiosk.projectId)
    ).length,
    appCount: workspace.apps.filter((app) => meaningfulProjects.some((project) => project.id === app.projectId)).length,
    versionCount: workspace.versions.length,
  };
}

function clearAuthState() {
  state.auth.user = null;
  state.auth.session = null;
}

function loadThemeMode() {
  return normalizeThemeMode(window.localStorage.getItem(THEME_STORAGE_KEY));
}

function persistThemeMode() {
  window.localStorage.setItem(THEME_STORAGE_KEY, state.ui.themeMode);
}

function applyThemeMode(themeMode) {
  document.body.dataset.theme = normalizeThemeMode(themeMode);
}

function normalizeThemeMode(themeMode) {
  return themeMode === "night" ? "night" : "day";
}

function loadGuestWorkspace() {
  const storedWorkspace = safeJsonParse(window.localStorage.getItem(GUEST_WORKSPACE_KEY));
  if (storedWorkspace) {
    return normalizeGuestWorkspace(storedWorkspace);
  }

  const legacyTasks = safeJsonParse(window.localStorage.getItem(LEGACY_STORAGE_KEY));
  if (Array.isArray(legacyTasks) && legacyTasks.length) {
    const migratedWorkspace = migrateLegacyTasks(legacyTasks);
    window.localStorage.setItem(GUEST_WORKSPACE_KEY, JSON.stringify(migratedWorkspace));
    return migratedWorkspace;
  }

  return createEmptyGuestWorkspace();
}

function persistGuestWorkspace() {
  window.localStorage.setItem(GUEST_WORKSPACE_KEY, JSON.stringify(state.guestWorkspace));
}

function updateGuestWorkspace(mutator, options = {}) {
  const { resetImportMarks = true } = options;
  const workspace = deepClone(state.guestWorkspace);
  mutator(workspace);

  const normalizedWorkspace = normalizeGuestWorkspace(workspace);
  normalizedWorkspace.importedUsers = resetImportMarks
    ? []
    : normalizedWorkspace.importedUsers;
  state.guestWorkspace = normalizedWorkspace;
  persistGuestWorkspace();
}

function normalizeGuestWorkspace(workspace) {
  const normalizedWorkspace = workspace && typeof workspace === "object" ? workspace : {};
  normalizedWorkspace.version = 4;
  normalizedWorkspace.importedUsers = Array.isArray(normalizedWorkspace.importedUsers)
    ? normalizedWorkspace.importedUsers.map((userId) => String(userId))
    : [];
  normalizedWorkspace.projects = Array.isArray(normalizedWorkspace.projects)
    ? normalizedWorkspace.projects.map(normalizeGuestProject)
    : [];
  normalizedWorkspace.tags = Array.isArray(normalizedWorkspace.tags)
    ? normalizedWorkspace.tags.map(normalizeGuestTag)
    : [];
  normalizedWorkspace.kiosks = Array.isArray(normalizedWorkspace.kiosks)
    ? normalizedWorkspace.kiosks.map(normalizeGuestKiosk)
    : [];
  normalizedWorkspace.tasks = Array.isArray(normalizedWorkspace.tasks)
    ? normalizedWorkspace.tasks.map(normalizeGuestTask)
    : [];
  normalizedWorkspace.apps = Array.isArray(normalizedWorkspace.apps)
    ? normalizedWorkspace.apps.map(normalizeGuestApp)
    : [];
  normalizedWorkspace.versions = Array.isArray(normalizedWorkspace.versions)
    ? normalizedWorkspace.versions.map(normalizeGuestVersion)
    : [];

  if (!normalizedWorkspace.projects.length) {
    normalizedWorkspace.projects = [createDefaultGuestProject()];
  }

  let validProjectIds = new Set(normalizedWorkspace.projects.map((project) => project.id));
  const hasLegacyApps = normalizedWorkspace.apps.some((app) => !validProjectIds.has(app.projectId));
  if (hasLegacyApps) {
    let migrationProject = normalizedWorkspace.projects.find(
      (project) => project.name === LEGACY_APP_MIGRATION_PROJECT_NAME
    );
    if (!migrationProject) {
      migrationProject = createLegacyGuestAppMigrationProject();
      normalizedWorkspace.projects.unshift(migrationProject);
    }
    validProjectIds = new Set(normalizedWorkspace.projects.map((project) => project.id));
    normalizedWorkspace.apps = normalizedWorkspace.apps.map((app) =>
      validProjectIds.has(app.projectId)
        ? app
        : {
            ...app,
            projectId: migrationProject.id,
          }
    );
  }

  normalizedWorkspace.tags = normalizedWorkspace.tags.filter((tag) =>
    validProjectIds.has(tag.projectId)
  );
  normalizedWorkspace.kiosks = normalizedWorkspace.kiosks.filter((kiosk) =>
    validProjectIds.has(kiosk.projectId)
  );
  normalizedWorkspace.tasks = normalizedWorkspace.tasks.filter((task) =>
    validProjectIds.has(task.projectId)
  );
  normalizedWorkspace.apps = normalizedWorkspace.apps.filter((app) =>
    validProjectIds.has(app.projectId)
  );
  const validAppIds = new Set(normalizedWorkspace.apps.map((app) => app.id));
  normalizedWorkspace.versions = normalizedWorkspace.versions.filter((version) =>
    validAppIds.has(version.appId)
  );
  const appById = new Map(normalizedWorkspace.apps.map((app) => [app.id, app]));
  const versionById = new Map(
    normalizedWorkspace.versions.map((version) => [version.id, version])
  );
  normalizedWorkspace.kiosks = normalizedWorkspace.kiosks.map((kiosk) => {
    const activeApp = appById.get(kiosk.activeAppId);
    const activeVersion = versionById.get(kiosk.activeVersionId);
    if (!activeApp || activeApp.projectId !== kiosk.projectId) {
      return {
        ...kiosk,
        activeAppId: "",
        activeVersionId: "",
      };
    }
    if (!activeVersion || activeVersion.appId !== activeApp.id) {
      return {
        ...kiosk,
        activeVersionId: "",
      };
    }
    return kiosk;
  });

  normalizedWorkspace.currentProjectId = validProjectIds.has(
    normalizedWorkspace.currentProjectId
  )
    ? normalizedWorkspace.currentProjectId
    : normalizedWorkspace.projects.find((project) => !project.archived)?.id ||
      normalizedWorkspace.projects[0].id;
  normalizedWorkspace.currentAppId = validAppIds.has(normalizedWorkspace.currentAppId)
    ? normalizedWorkspace.currentAppId
    : normalizedWorkspace.apps.find((app) => !app.archived)?.id ||
      normalizedWorkspace.apps[0]?.id ||
      null;

  return normalizedWorkspace;
}

function createEmptyGuestWorkspace() {
  const project = createDefaultGuestProject();
  return {
    version: 4,
    importedUsers: [],
    currentProjectId: project.id,
    currentAppId: null,
    projects: [project],
    tags: [],
    kiosks: [],
    tasks: [],
    apps: [],
    versions: [],
  };
}

function createDefaultGuestProject() {
  const now = new Date().toISOString();
  return {
    id: createId(),
    name: DEFAULT_PROJECT_NAME,
    description: DEFAULT_PROJECT_DESCRIPTION,
    color: "#c16b39",
    archived: false,
    createdAt: now,
    updatedAt: now,
  };
}

function createLegacyGuestAppMigrationProject() {
  const now = new Date().toISOString();
  return {
    id: createId(),
    name: LEGACY_APP_MIGRATION_PROJECT_NAME,
    description: LEGACY_APP_MIGRATION_PROJECT_DESCRIPTION,
    color: "#245a73",
    archived: false,
    createdAt: now,
    updatedAt: now,
  };
}

function normalizeGuestProject(project) {
  return {
    id: String(project.id || createId()),
    name: String(project.name || DEFAULT_PROJECT_NAME).trim() || DEFAULT_PROJECT_NAME,
    description: String(project.description || "").trim(),
    color: normalizeHexColor(project.color, "#c16b39"),
    archived: Boolean(project.archived),
    createdAt: project.createdAt || new Date().toISOString(),
    updatedAt: project.updatedAt || project.createdAt || new Date().toISOString(),
  };
}

function normalizeGuestTag(tag) {
  return {
    id: String(tag.id || createId()),
    projectId: String(tag.projectId || ""),
    name: String(tag.name || "").trim(),
    color: normalizeHexColor(tag.color, "#245a73"),
    createdAt: tag.createdAt || new Date().toISOString(),
  };
}

function normalizeGuestKiosk(kiosk) {
  return {
    id: String(kiosk.id || createId()),
    projectId: String(kiosk.projectId || ""),
    region: String(kiosk.region || "").trim(),
    location: String(kiosk.location || "").trim(),
    printerConnection: KIOSK_PRINTER_CONNECTION_META[kiosk.printerConnection]
      ? kiosk.printerConnection
      : "usb",
    printerModel: String(kiosk.printerModel || "").trim(),
    printerNotes: String(kiosk.printerNotes || "").trim(),
    kioskPlatform: String(kiosk.kioskPlatform || "").trim(),
    remotePlatform: String(kiosk.remotePlatform || "").trim(),
    remoteCode: String(kiosk.remoteCode || "").trim(),
    activeAppId: String(kiosk.activeAppId || "").trim(),
    activeVersionId: String(kiosk.activeVersionId || "").trim(),
    notes: String(kiosk.notes || "").trim(),
    createdAt: kiosk.createdAt || new Date().toISOString(),
    updatedAt: kiosk.updatedAt || kiosk.createdAt || new Date().toISOString(),
  };
}

function normalizeGuestTask(task) {
  const status = STATUS_META[task.status] ? task.status : "todo";
  return {
    id: String(task.id || createId()),
    projectId: String(task.projectId || ""),
    title: String(task.title || "").trim(),
    description: String(task.description || "").trim(),
    notes: String(task.notes || "").trim(),
    assignee: String(task.assignee || "").trim(),
    status,
    priority: PRIORITY_META[task.priority] ? task.priority : "medium",
    startDate: /^\d{4}-\d{2}-\d{2}$/.test(String(task.startDate || ""))
      ? task.startDate
      : "",
    dueDate: /^\d{4}-\d{2}-\d{2}$/.test(String(task.dueDate || "")) ? task.dueDate : "",
    completedDate: resolveGuestCompletedDateForStatus(
      status,
      /^\d{4}-\d{2}-\d{2}$/.test(String(task.completedDate || ""))
        ? task.completedDate
        : "",
      { useTodayIfEmpty: false }
    ),
    tagIds: Array.isArray(task.tagIds) ? task.tagIds.map(String) : [],
    subtasks: Array.isArray(task.subtasks)
      ? task.subtasks.map((subtask) => ({
          id: String(subtask.id || createId()),
          title: String(subtask.title || "").trim(),
          completed: Boolean(subtask.completed),
          createdAt: subtask.createdAt || new Date().toISOString(),
          updatedAt: subtask.updatedAt || subtask.createdAt || new Date().toISOString(),
        }))
      : [],
    createdAt: task.createdAt || new Date().toISOString(),
    updatedAt: task.updatedAt || task.createdAt || new Date().toISOString(),
  };
}

function normalizeGuestApp(app) {
  return {
    id: String(app.id || createId()),
    projectId: String(app.projectId || ""),
    name: String(app.name || "未命名 App").trim() || "未命名 App",
    description: String(app.description || "").trim(),
    color: normalizeHexColor(app.color, "#245a73"),
    platform: APP_PLATFORM_META[app.platform] ? app.platform : "ios",
    bundleId: String(app.bundleId || "").trim(),
    archived: Boolean(app.archived),
    createdAt: app.createdAt || new Date().toISOString(),
    updatedAt: app.updatedAt || app.createdAt || new Date().toISOString(),
  };
}

function normalizeGuestVersion(version) {
  const status = VERSION_STATUS_META[version.status] ? version.status : "todo";
  return {
    id: String(version.id || createId()),
    appId: String(version.appId || ""),
    versionName: String(version.versionName || "").trim(),
    buildNumber: String(version.buildNumber || "").trim(),
    resourceVersion: String(version.resourceVersion || "").trim(),
    description: String(version.description || "").trim(),
    notes: String(version.notes || "").trim(),
    owner: String(version.owner || "").trim(),
    channel: VERSION_CHANNEL_META[version.channel] ? version.channel : "stable",
    status,
    priority: PRIORITY_META[version.priority] ? version.priority : "medium",
    plannedDate: /^\d{4}-\d{2}-\d{2}$/.test(String(version.plannedDate || ""))
      ? version.plannedDate
      : "",
    releaseDate: /^\d{4}-\d{2}-\d{2}$/.test(String(version.releaseDate || ""))
      ? version.releaseDate
      : "",
    publishedDate: resolveGuestPublishedDateForStatus(
      status,
      /^\d{4}-\d{2}-\d{2}$/.test(String(version.publishedDate || ""))
        ? version.publishedDate
        : "",
      { useTodayIfEmpty: false }
    ),
    createdAt: version.createdAt || new Date().toISOString(),
    updatedAt: version.updatedAt || version.createdAt || new Date().toISOString(),
  };
}

function guestWorkspaceHasMeaningfulData(workspace) {
  return (
    workspace.projects.some((project) => guestProjectHasMeaningfulData(workspace, project.id)) ||
    workspace.kiosks.length > 0 ||
    workspace.tasks.length > 0 ||
    workspace.versions.length > 0 ||
    workspace.tags.length > 0 ||
    workspace.apps.length > 0
  );
}

function guestProjectHasMeaningfulData(workspace, projectId) {
  const project = workspace.projects.find((item) => item.id === projectId);
  if (!project) {
    return false;
  }

  const hasTaskData = workspace.tasks.some((task) => task.projectId === projectId);
  const hasTagData = workspace.tags.some((tag) => tag.projectId === projectId);
  const hasKioskData = workspace.kiosks.some((kiosk) => kiosk.projectId === projectId);
  const hasAppData = workspace.apps.some((app) => app.projectId === projectId);
  if (hasTaskData || hasTagData || hasKioskData || hasAppData) {
    return true;
  }

  return !isDefaultPlaceholderGuestProject(project);
}

function isDefaultPlaceholderGuestProject(project) {
  return (
    project.name === DEFAULT_PROJECT_NAME &&
    project.description === DEFAULT_PROJECT_DESCRIPTION &&
    project.color === "#c16b39" &&
    project.archived === false
  );
}

function isPlaceholderGuestWorkspace(workspace) {
  if (
    workspace.tasks.length > 0 ||
    workspace.tags.length > 0 ||
    workspace.kiosks.length > 0 ||
    workspace.apps.length > 0 ||
    workspace.versions.length > 0
  ) {
    return false;
  }

  if (workspace.projects.length === 0) {
    return true;
  }

  if (workspace.projects.length > 1) {
    return false;
  }

  const project = workspace.projects[0];
  return isDefaultPlaceholderGuestProject(project);
}

function markGuestWorkspaceImported(userId) {
  if (!userId) {
    return;
  }

  const importedUsers = new Set(state.guestWorkspace.importedUsers);
  importedUsers.add(String(userId));
  state.guestWorkspace.importedUsers = [...importedUsers];
  persistGuestWorkspace();
}

function migrateLegacyTasks(legacyTasks) {
  const workspace = createEmptyGuestWorkspace();
  const projectId = workspace.currentProjectId;
  const tagIdByCategory = new Map();

  legacyTasks.forEach((task) => {
    const category = String(task.category || "").trim();
    if (category && !tagIdByCategory.has(category)) {
      const tag = {
        id: createId(),
        projectId,
        name: category,
        color: "#4f7a56",
        createdAt: new Date().toISOString(),
      };
      workspace.tags.push(tag);
      tagIdByCategory.set(category, tag.id);
    }

    workspace.tasks.push({
      id: String(task.id || createId()),
      projectId,
      title: String(task.title || "").trim(),
      description: String(task.description || "").trim(),
      notes: "",
      assignee: "",
      status: STATUS_META[task.status] ? task.status : "todo",
      priority: PRIORITY_META[task.priority] ? task.priority : "medium",
      startDate: "",
      dueDate: /^\d{4}-\d{2}-\d{2}$/.test(String(task.dueDate || "")) ? task.dueDate : "",
      completedDate: resolveGuestCompletedDateForStatus(task.status, "", {
        useTodayIfEmpty: false,
      }),
      tagIds: category ? [tagIdByCategory.get(category)] : [],
      subtasks: [],
      createdAt: task.createdAt || new Date().toISOString(),
      updatedAt: task.updatedAt || task.createdAt || new Date().toISOString(),
    });
  });

  return workspace;
}

function buildDemoWorkspacePayload() {
  const today = new Date();
  const plus = (days) => {
    const date = new Date(today);
    date.setDate(date.getDate() + days);
    return formatDateInputValue(date);
  };

  return {
    source: "task-atlas",
    version: 4,
    scope: "workspace",
    exportedAt: new Date().toISOString(),
    projects: [
      {
        project: {
          name: "官网改版冲刺",
          description: "围绕品牌页、功能页和埋点联调整理的演示项目。",
          color: "#c16b39",
          archived: false,
        },
        tags: [
          { name: "设计", color: "#245a73" },
          { name: "开发", color: "#4f7a56" },
          { name: "发布", color: "#a84738" },
        ],
        kiosks: [
          {
            region: "华东 / 上海",
            location: "虹桥门店一层入口",
            printerConnection: "usb",
            printerModel: "EPSON TM-m30III",
            printerNotes: "收银台下方 USB 直连，驱动已预装。",
            kioskPlatform: "Windows 11",
            remotePlatform: "向日葵",
            remoteCode: "SH-HQ-01",
            notes: "现场网络走商场专线，重启后需等待远控服务自启。",
          },
        ],
        tasks: [
          {
            title: "整理首页改版清单",
            description: "梳理视觉、文案和埋点改动范围。",
            assignee: "Ava",
            status: "doing",
            priority: "high",
            startDate: plus(-1),
            dueDate: plus(1),
            tagNames: ["设计", "开发"],
            subtasks: [
              { title: "设计差异截图确认", completed: true },
              { title: "组件替换范围标注", completed: false },
            ],
          },
          {
            title: "确认发布说明和回滚方案",
            description: "输出发布窗口、值班人和应急回滚流程。",
            assignee: "Noah",
            status: "review",
            priority: "urgent",
            startDate: plus(0),
            dueDate: plus(2),
            tagNames: ["发布"],
            subtasks: [
              { title: "发布模板补齐", completed: false },
              { title: "回滚链接校验", completed: false },
            ],
          },
        ],
        apps: [
          {
            app: {
              name: "Task Atlas Web",
              description: "Web 端版本演示数据，用于验证项目维度下的 App 管理。",
              color: "#c16b39",
              platform: "web",
              bundleId: "web.taskatlas.app",
              archived: false,
            },
            versions: [
              {
                versionName: "1.9.0",
                buildNumber: "19003",
                resourceVersion: "web-assets-19003",
                description: "准备接入版本中心和变更日志入口。",
                notes: "先完成内部包，再推进 Beta 验证。",
                owner: "Mila",
                channel: "internal",
                status: "doing",
                priority: "medium",
                plannedDate: plus(-1),
                releaseDate: plus(5),
              },
            ],
          },
        ],
      },
      {
        project: {
          name: "增长实验池",
          description: "收纳下周要启动的增长实验与验证任务。",
          color: "#245a73",
          archived: false,
        },
        tags: [
          { name: "分析", color: "#8c651a" },
          { name: "待确认", color: "#7a3c1e" },
        ],
        tasks: [
          {
            title: "准备激活漏斗复盘",
            description: "复核埋点字段并补齐转化节点注释。",
            assignee: "Mia",
            status: "todo",
            priority: "medium",
            startDate: "",
            dueDate: plus(4),
            tagNames: ["分析"],
            subtasks: [
              { title: "导出关键节点数据", completed: false },
              { title: "补齐复盘文档目录", completed: false },
            ],
          },
        ],
        apps: [
          {
            app: {
              name: "Task Atlas iOS",
              description: "移动端版本演示数据，覆盖开发、待发布和已发布节奏。",
              color: "#245a73",
              platform: "ios",
              bundleId: "com.taskatlas.ios",
              archived: false,
            },
            versions: [
              {
                versionName: "2.4.0",
                buildNumber: "24015",
                resourceVersion: "ios-res-24015",
                description: "补齐仪表盘发布页和版本入口联动。",
                notes: "上线前需要确认审核素材和灰度回滚方案。",
                owner: "Ethan",
                channel: "gray",
                status: "review",
                priority: "high",
                plannedDate: plus(-3),
                releaseDate: plus(1),
              },
              {
                versionName: "2.3.2",
                buildNumber: "23208",
                resourceVersion: "ios-res-23208-hotfix",
                description: "修复登录态丢失和启动页白屏问题。",
                notes: "这是一个 Hotfix 版本，保持最小改动上线。",
                owner: "Luna",
                channel: "hotfix",
                status: "done",
                priority: "urgent",
                plannedDate: plus(-7),
                releaseDate: plus(-4),
                publishedDate: plus(-4),
              },
            ],
          },
        ],
      },
    ],
  };
}

function buildGuestWorkspaceExportPayload(workspace) {
  const exportableProjects = workspace.projects.filter((project) =>
    guestProjectHasMeaningfulData(workspace, project.id)
  );

  return {
    source: "task-atlas",
    version: 4,
    scope: "workspace",
    exportedAt: new Date().toISOString(),
    projects: exportableProjects.map((project) =>
      buildGuestProjectExportPayload(workspace, project.id)
    ),
  };
}

function buildGuestProjectExportPayload(workspace, projectId) {
  const project = workspace.projects.find((item) => item.id === projectId);
  if (!project) {
    throw new Error("项目不存在");
  }

  const tags = workspace.tags.filter((tag) => tag.projectId === projectId);
  const tagMap = new Map(tags.map((tag) => [tag.id, tag]));
  const tasks = workspace.tasks.filter((task) => task.projectId === projectId);
  const apps = workspace.apps.filter((app) => app.projectId === projectId);
  const kiosks = workspace.kiosks.filter((kiosk) => kiosk.projectId === projectId);

  return {
    source: "task-atlas",
    version: 4,
    scope: "project",
    exportedAt: new Date().toISOString(),
    project: {
      name: project.name,
      description: project.description,
      color: project.color,
      archived: project.archived,
    },
    tags: tags.map((tag) => ({
      name: tag.name,
      color: tag.color,
    })),
    kiosks: kiosks.map((kiosk) => ({
      region: kiosk.region,
      location: kiosk.location,
      printerConnection: kiosk.printerConnection,
      printerModel: kiosk.printerModel,
      printerNotes: kiosk.printerNotes,
      kioskPlatform: kiosk.kioskPlatform,
      remotePlatform: kiosk.remotePlatform,
      remoteCode: kiosk.remoteCode,
      notes: kiosk.notes,
    })),
    tasks: tasks.map((task) => ({
      title: task.title,
      description: task.description,
      notes: task.notes,
      assignee: task.assignee,
      status: task.status,
      priority: task.priority,
      startDate: task.startDate,
      dueDate: task.dueDate,
      completedDate: task.completedDate,
      tagNames: task.tagIds
        .map((tagId) => tagMap.get(tagId))
        .filter(Boolean)
        .map((tag) => tag.name),
      subtasks: task.subtasks.map((subtask) => ({
        title: subtask.title,
        completed: subtask.completed,
      })),
    })),
    apps: apps.map((app) => buildGuestAppExportPayload(workspace, app.id)),
  };
}

function buildGuestAppExportPayload(workspace, appId) {
  const app = workspace.apps.find((item) => item.id === appId);
  if (!app) {
    throw new Error("App 不存在");
  }

  const project = workspace.projects.find((item) => item.id === app.projectId) || null;
  const versions = workspace.versions.filter((version) => version.appId === appId);

  return {
    source: "task-atlas",
    version: 4,
    scope: "app",
    exportedAt: new Date().toISOString(),
    project: project
      ? {
          name: project.name,
          description: project.description,
          color: project.color,
          archived: project.archived,
        }
      : undefined,
    app: {
      name: app.name,
      description: app.description,
      color: app.color,
      platform: app.platform,
      bundleId: app.bundleId,
      archived: app.archived,
    },
    versions: versions.map((version) => ({
      versionName: version.versionName,
      buildNumber: version.buildNumber,
      resourceVersion: version.resourceVersion,
      description: version.description,
      notes: version.notes,
      owner: version.owner,
      channel: version.channel,
      status: version.status,
      priority: version.priority,
      plannedDate: version.plannedDate,
      releaseDate: version.releaseDate,
      publishedDate: version.publishedDate,
    })),
  };
}

function importPayloadIntoGuestWorkspace(workspace, payload) {
  const sourceWorkspace = workspace && typeof workspace === "object" ? deepClone(workspace) : {};
  let nextWorkspace = {
    version: 4,
    importedUsers: Array.isArray(sourceWorkspace.importedUsers)
      ? sourceWorkspace.importedUsers.map((userId) => String(userId))
      : [],
    currentProjectId: sourceWorkspace.currentProjectId
      ? String(sourceWorkspace.currentProjectId)
      : null,
    currentAppId: sourceWorkspace.currentAppId ? String(sourceWorkspace.currentAppId) : null,
    projects: Array.isArray(sourceWorkspace.projects)
      ? sourceWorkspace.projects.map(normalizeGuestProject)
      : [],
    tags: Array.isArray(sourceWorkspace.tags)
      ? sourceWorkspace.tags.map(normalizeGuestTag)
      : [],
    kiosks: Array.isArray(sourceWorkspace.kiosks)
      ? sourceWorkspace.kiosks.map(normalizeGuestKiosk)
      : [],
    tasks: Array.isArray(sourceWorkspace.tasks)
      ? sourceWorkspace.tasks.map(normalizeGuestTask)
      : [],
    apps: Array.isArray(sourceWorkspace.apps)
      ? sourceWorkspace.apps.map(normalizeGuestApp)
      : [],
    versions: Array.isArray(sourceWorkspace.versions)
      ? sourceWorkspace.versions.map(normalizeGuestVersion)
      : [],
  };

  if (isPlaceholderGuestWorkspace(nextWorkspace)) {
    nextWorkspace = {
      version: 4,
      importedUsers: [],
      currentProjectId: null,
      currentAppId: null,
      projects: [],
      tags: [],
      kiosks: [],
      tasks: [],
      apps: [],
      versions: [],
    };
  }

  if (payload.scope === "workspace") {
    if (Array.isArray(payload.projects)) {
      payload.projects.forEach((projectPayload) => {
        importProjectPayloadIntoGuestWorkspace(nextWorkspace, projectPayload);
      });
    }

    if (Array.isArray(payload.apps)) {
      const legacyProjectId = createGuestImportProject(nextWorkspace, {
        name: inferGuestLegacyAppProjectName(payload.apps),
        description: "自动承接旧版工作区 JSON 中独立 App 数据的项目。",
        color: "#245a73",
      });
      payload.apps.forEach((appPayload) => {
        importAppPayloadIntoGuestWorkspace(nextWorkspace, appPayload, legacyProjectId);
      });
    }
  } else if ((payload.scope === "app" || (!payload.scope && payload.app)) && payload.app) {
    importAppPayloadIntoGuestWorkspace(nextWorkspace, payload);
  } else if (
    (payload.scope === "project" ||
      (!payload.scope && payload.project && Array.isArray(payload.apps))) &&
    payload.project
  ) {
    importProjectPayloadIntoGuestWorkspace(nextWorkspace, payload);
  } else {
    throw new Error("暂不支持当前 JSON 结构");
  }

  nextWorkspace.importedUsers = [];
  nextWorkspace.currentProjectId =
    nextWorkspace.projects[0]?.id || nextWorkspace.currentProjectId || null;
  nextWorkspace.currentAppId =
    nextWorkspace.apps.find((app) => app.projectId === nextWorkspace.currentProjectId)?.id ||
    nextWorkspace.currentAppId ||
    null;

  return normalizeGuestWorkspace(nextWorkspace);
}

function importProjectPayloadIntoGuestWorkspace(workspace, payload) {
  const projectData = payload.project || payload;
  const tags = Array.isArray(payload.tags) ? payload.tags : [];
  const kiosks = Array.isArray(payload.kiosks) ? payload.kiosks : [];
  const tasks = Array.isArray(payload.tasks) ? payload.tasks : [];
  const now = new Date().toISOString();
  const projectId = createGuestImportProject(workspace, {
    name: String(projectData.name || "导入项目").trim() || "导入项目",
    description: String(projectData.description || "").trim(),
    color: normalizeHexColor(projectData.color, "#c16b39"),
    archived: Boolean(projectData.archived),
    createdAt: now,
    updatedAt: now,
  });

  const tagIdByName = new Map();
  tags.forEach((tag) => {
    const tagId = createId();
    const normalizedName = String(tag.name || "").trim();
    workspace.tags.push({
      id: tagId,
      projectId,
      name: normalizedName,
      color: normalizeHexColor(tag.color, "#245a73"),
      createdAt: now,
    });
    tagIdByName.set(normalizedName, tagId);
  });

  kiosks.forEach((kiosk) => {
    workspace.kiosks.unshift(
      normalizeGuestKiosk({
        id: createId(),
        projectId,
        region: kiosk.region,
        location: kiosk.location,
        printerConnection: kiosk.printerConnection,
        printerModel: kiosk.printerModel,
        printerNotes: kiosk.printerNotes,
        kioskPlatform: kiosk.kioskPlatform,
        remotePlatform: kiosk.remotePlatform,
        remoteCode: kiosk.remoteCode,
        notes: kiosk.notes,
        createdAt: now,
        updatedAt: now,
      })
    );
  });

  tasks.forEach((task) => {
    const taskId = createId();
    workspace.tasks.push({
      id: taskId,
      projectId,
      title: String(task.title || "未命名任务").trim() || "未命名任务",
      description: String(task.description || "").trim(),
      notes: String(task.notes || "").trim(),
      assignee: String(task.assignee || "").trim(),
      status: STATUS_META[task.status] ? task.status : "todo",
      priority: PRIORITY_META[task.priority] ? task.priority : "medium",
      startDate: /^\d{4}-\d{2}-\d{2}$/.test(String(task.startDate || ""))
        ? task.startDate
        : "",
      dueDate: /^\d{4}-\d{2}-\d{2}$/.test(String(task.dueDate || ""))
        ? task.dueDate
        : "",
      completedDate: resolveGuestCompletedDateForStatus(
        task.status,
        /^\d{4}-\d{2}-\d{2}$/.test(String(task.completedDate || ""))
          ? task.completedDate
          : "",
        { useTodayIfEmpty: false }
      ),
      tagIds: Array.isArray(task.tagNames)
        ? task.tagNames.map((name) => tagIdByName.get(String(name))).filter(Boolean)
        : [],
      subtasks: Array.isArray(task.subtasks)
        ? task.subtasks.map((subtask) => ({
            id: createId(),
            title: String(subtask.title || "").trim(),
            completed: Boolean(subtask.completed),
            createdAt: now,
            updatedAt: now,
          }))
        : [],
      createdAt: now,
      updatedAt: now,
    });
  });

  if (Array.isArray(payload.apps)) {
    payload.apps.forEach((appPayload) => {
      importAppPayloadIntoGuestWorkspace(workspace, appPayload, projectId);
    });
  }

  workspace.currentProjectId = projectId;
}

function createGuestImportProject(workspace, payload = {}) {
  const now = new Date().toISOString();
  const projectId = createId();

  workspace.projects.unshift({
    id: projectId,
    name: String(payload.name || "导入项目").trim() || "导入项目",
    description: String(payload.description || "").trim(),
    color: normalizeHexColor(payload.color, "#c16b39"),
    archived: Boolean(payload.archived),
    createdAt: payload.createdAt || now,
    updatedAt: payload.updatedAt || payload.createdAt || now,
  });

  return projectId;
}

function inferGuestLegacyAppProjectName(apps) {
  const firstAppName = apps[0]?.app?.name || apps[0]?.name || "";
  return firstAppName ? `${String(firstAppName).trim()} 项目` : "导入应用项目";
}

function importAppPayloadIntoGuestWorkspace(workspace, payload, projectId = null) {
  const appData = payload.app || payload;
  const projectData = payload.project || {};
  const versions = Array.isArray(payload.versions) ? payload.versions : [];
  const now = new Date().toISOString();
  const appId = createId();
  const resolvedProjectId =
    projectId ||
    createGuestImportProject(workspace, {
      name:
        projectData.name ||
        `${String(appData.name || "导入 App").trim() || "导入 App"} 项目`,
      description: projectData.description || "自动承接独立 App 导入数据的项目。",
      color: normalizeHexColor(projectData.color, "#245a73"),
      archived: Boolean(projectData.archived),
      createdAt: now,
      updatedAt: now,
    });

  workspace.apps.unshift({
    id: appId,
    projectId: resolvedProjectId,
    name: String(appData.name || "导入 App").trim() || "导入 App",
    description: String(appData.description || "").trim(),
    color: normalizeHexColor(appData.color, "#245a73"),
    platform: APP_PLATFORM_META[appData.platform] ? appData.platform : "ios",
    bundleId: String(appData.bundleId || "").trim(),
    archived: Boolean(appData.archived),
    createdAt: now,
    updatedAt: now,
  });

  versions.forEach((version) => {
    workspace.versions.push({
      id: createId(),
      appId,
      versionName: String(version.versionName || "").trim(),
      buildNumber: String(version.buildNumber || "").trim(),
      resourceVersion: String(version.resourceVersion || "").trim(),
      description: String(version.description || "").trim(),
      notes: String(version.notes || "").trim(),
      owner: String(version.owner || "").trim(),
      channel: VERSION_CHANNEL_META[version.channel] ? version.channel : "stable",
      status: VERSION_STATUS_META[version.status] ? version.status : "todo",
      priority: PRIORITY_META[version.priority] ? version.priority : "medium",
      plannedDate: /^\d{4}-\d{2}-\d{2}$/.test(String(version.plannedDate || ""))
        ? version.plannedDate
        : "",
      releaseDate: /^\d{4}-\d{2}-\d{2}$/.test(String(version.releaseDate || ""))
        ? version.releaseDate
        : "",
      publishedDate: resolveGuestPublishedDateForStatus(
        version.status,
        /^\d{4}-\d{2}-\d{2}$/.test(String(version.publishedDate || ""))
          ? version.publishedDate
          : "",
        { useTodayIfEmpty: false }
      ),
      createdAt: now,
      updatedAt: now,
    });
  });

  workspace.currentAppId = appId;
  workspace.currentProjectId = resolvedProjectId;
}

async function apiRequest(url, options = {}) {
  const { body, headers = {}, method = "GET" } = options;
  const requestHeaders = new Headers(headers);
  const fetchOptions = {
    method,
    headers: requestHeaders,
  };

  if (body !== undefined) {
    requestHeaders.set("Content-Type", "application/json");
    fetchOptions.body = JSON.stringify(body);
  }

  const response = await fetch(url, fetchOptions);
  const text = await response.text();
  const payload = text ? safeJsonParse(text) : null;

  if (!response.ok) {
    const error = new Error(payload?.error?.message || "请求失败，请稍后重试");
    error.status = response.status;
    error.code = payload?.error?.code || "REQUEST_FAILED";
    throw error;
  }

  return payload;
}

function showToast(message) {
  window.clearTimeout(state.toastTimer);
  elements.toast.textContent = message;
  elements.toast.classList.add("show");

  state.toastTimer = window.setTimeout(() => {
    elements.toast.classList.remove("show");
  }, 2200);
}

function sortProjects(projects) {
  return [...projects].sort((left, right) => {
    if (left.archived !== right.archived) {
      return Number(left.archived) - Number(right.archived);
    }
    return toTimestamp(right.updatedAt) - toTimestamp(left.updatedAt);
  });
}

function resolveSelectedProject(projects, preferredProjectId) {
  if (!projects.length) {
    return null;
  }

  return (
    projects.find((project) => project.id === preferredProjectId) ||
    projects.find((project) => !project.archived) ||
    projects[0]
  );
}

function toTimestamp(value) {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? 0 : date.getTime();
}

function isCalendarDateKey(value) {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(value || "").trim());
  if (!match) {
    return false;
  }

  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const date = new Date(year, month - 1, day);
  return (
    date.getFullYear() === year &&
    date.getMonth() === month - 1 &&
    date.getDate() === day
  );
}

function isCalendarMonthKey(value) {
  const match = /^(\d{4})-(\d{2})$/.exec(String(value || "").trim());
  if (!match) {
    return false;
  }

  const year = Number(match[1]);
  const month = Number(match[2]);
  const date = new Date(year, month - 1, 1);
  return date.getFullYear() === year && date.getMonth() === month - 1;
}

function normalizeCalendarDateKey(value) {
  return isCalendarDateKey(value) ? String(value).trim() : todayString();
}

function normalizeCalendarMonthKey(value, fallbackDate = todayString()) {
  if (isCalendarMonthKey(value)) {
    return String(value).trim();
  }

  return getCalendarMonthKey(fallbackDate);
}

function getCalendarMonthKey(value) {
  const normalizedValue = String(value || "").trim();
  if (isCalendarMonthKey(normalizedValue)) {
    return normalizedValue;
  }

  if (isCalendarDateKey(normalizedValue)) {
    return normalizedValue.slice(0, 7);
  }

  return todayString().slice(0, 7);
}

function parseCalendarDateKey(value) {
  const dateKey = normalizeCalendarDateKey(value);
  const [year, month, day] = dateKey.split("-").map(Number);
  return new Date(year, month - 1, day);
}

function parseCalendarMonthKey(value) {
  const monthKey = normalizeCalendarMonthKey(value);
  const [year, month] = monthKey.split("-").map(Number);
  return new Date(year, month - 1, 1);
}

function formatCalendarMonthLabel(monthKey) {
  return new Intl.DateTimeFormat("zh-CN", {
    year: "numeric",
    month: "long",
  }).format(parseCalendarMonthKey(monthKey));
}

function formatCalendarDetailTitle(dateKey) {
  return new Intl.DateTimeFormat("zh-CN", {
    year: "numeric",
    month: "numeric",
    day: "numeric",
    weekday: "short",
  }).format(parseCalendarDateKey(dateKey));
}

function updateTodayLabel() {
  const formatter = new Intl.DateTimeFormat("zh-CN", {
    month: "long",
    day: "numeric",
    weekday: "long",
  });
  elements.todayLabel.textContent = formatter.format(new Date());
}

function formatDateTime(value) {
  if (!value) {
    return "未知";
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "未知";
  }

  return new Intl.DateTimeFormat("zh-CN", {
    year: "numeric",
    month: "numeric",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

function formatDateOnly(value) {
  if (!value) {
    return "未知";
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "未知";
  }

  return new Intl.DateTimeFormat("zh-CN", {
    year: "numeric",
    month: "numeric",
    day: "numeric",
  }).format(date);
}

function formatDateInputValue(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function todayString() {
  return formatDateInputValue(new Date());
}

function slugify(value) {
  return String(value || "task-atlas")
    .toLowerCase()
    .replace(/[^a-z0-9\u4e00-\u9fa5]+/gi, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
}

function downloadJson(payload, filename) {
  const blob = new Blob([JSON.stringify(payload, null, 2)], {
    type: "application/json",
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.append(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

async function writeTextToClipboard(text) {
  const value = String(text || "");
  if (!value) {
    throw new Error("没有可复制的内容");
  }

  if (navigator.clipboard?.writeText) {
    try {
      await navigator.clipboard.writeText(value);
      return;
    } catch (error) {
      // Fall back to the legacy copy path when clipboard permissions are unavailable.
    }
  }

  const textarea = document.createElement("textarea");
  textarea.value = value;
  textarea.setAttribute("readonly", "readonly");
  textarea.style.position = "fixed";
  textarea.style.opacity = "0";
  textarea.style.pointerEvents = "none";
  document.body.append(textarea);
  textarea.select();
  textarea.setSelectionRange(0, textarea.value.length);

  const succeeded = document.execCommand("copy");
  textarea.remove();

  if (!succeeded) {
    throw new Error("当前浏览器不支持自动复制");
  }
}

function normalizeHexColor(value, fallback) {
  const color = String(value || "").trim();
  return /^#[0-9a-fA-F]{6}$/.test(color) ? color.toLowerCase() : fallback;
}

function hexToSoftRgba(value, alpha = 0.14) {
  const color = normalizeHexColor(value, "#245a73").slice(1);
  const red = parseInt(color.slice(0, 2), 16);
  const green = parseInt(color.slice(2, 4), 16);
  const blue = parseInt(color.slice(4, 6), 16);
  return `rgba(${red}, ${green}, ${blue}, ${alpha})`;
}

function normalizeLocalDueDate(value) {
  const dueDate = String(value || "").trim();
  return /^\d{4}-\d{2}-\d{2}$/.test(dueDate) ? dueDate : "";
}

function safeJsonParse(value) {
  try {
    return JSON.parse(value);
  } catch (error) {
    return null;
  }
}

function deepClone(value) {
  return JSON.parse(JSON.stringify(value));
}

function createId() {
  if (window.crypto?.randomUUID) {
    return window.crypto.randomUUID();
  }

  return `task-${Date.now()}-${Math.random().toString(16).slice(2, 8)}`;
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function createEmptyWorkspaceView(mode) {
  return {
    mode,
    projects: [],
    currentProjectId: null,
    currentProject: null,
    tags: [],
    kiosks: [],
    tasks: [],
    overview: createEmptyOverview(),
  };
}

function createEmptyAppWorkspaceView(mode) {
  return {
    mode,
    projectId: null,
    apps: [],
    projectVersions: [],
    currentAppId: null,
    currentApp: null,
    versions: [],
    overview: createEmptyAppOverview(),
  };
}

function createEmptyScheduleAllProjectsView() {
  return {
    loading: false,
    error: "",
    projectIdsKey: "",
    projects: [],
    tasks: [],
    tags: [],
    apps: [],
    versions: [],
  };
}

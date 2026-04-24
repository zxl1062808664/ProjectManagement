const LEGACY_STORAGE_KEY = "task-atlas-data-v1";
const GUEST_WORKSPACE_KEY = "task-atlas-workspace-v2";
const THEME_STORAGE_KEY = "task-atlas-theme-v1";

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

const DEFAULT_PROJECT_NAME = "本地收件箱";
const DEFAULT_PROJECT_DESCRIPTION = "未登录时保存在浏览器中的默认项目。";
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
  overview: {
    label: "任务总览",
    description: "默认先看全局统计、状态分布和项目摘要，再进入详情处理具体任务。",
    group: "task-management",
  },
  details: {
    label: "任务详情",
    description: "按项目查看任务列表，并通过弹出面板管理项目和新建任务。",
    group: "task-management",
  },
  "app-overview": {
    label: "版本总览",
    description: "默认先看应用数量、版本状态分布和最近版本摘要，再进入详情推进发布节奏。",
    group: "app-version",
  },
  "app-details": {
    label: "版本详情",
    description: "按应用查看版本列表，并通过弹出面板管理 App 信息和版本记录。",
    group: "app-version",
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
  ui: {
    themeMode: loadThemeMode(),
    activeTool: "overview",
    collapsedGroups: {
      "task-management": false,
      "app-version": false,
      "data-tools": false,
      "common-tools": false,
      "account-sync": false,
    },
    projectFormMode: "edit",
    editingProjectId: null,
    editingTagId: null,
    editingTaskId: null,
    activeDetailPanel: null,
    expandedOverviewProjectIds: [],
    expandedTaskRecordIds: [],
    selectedTaskIds: [],
    detailSearch: "",
    detailStatusFilter: "all",
    detailTagFilter: "all",
    appFormMode: "edit",
    editingAppId: null,
    editingVersionId: null,
    activeAppDetailPanel: null,
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
  detailProjectCountBadge: document.querySelector("#detailProjectCountBadge"),
  detailProjectPanelButton: document.querySelector("#detailProjectPanelButton"),
  detailTaskPanelButton: document.querySelector("#detailTaskPanelButton"),
  detailPanelBackdrop: document.querySelector("#detailPanelBackdrop"),
  detailProjectPanel: document.querySelector("#detailProjectPanel"),
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
  selectVisibleTasksButton: document.querySelector("#selectVisibleTasksButton"),
  selectedTaskCountBadge: document.querySelector("#selectedTaskCountBadge"),
  bulkStatusInput: document.querySelector("#bulkStatusInput"),
  applyBulkStatusButton: document.querySelector("#applyBulkStatusButton"),
  taskDetailList: document.querySelector("#taskDetailList"),
  appDetailAppCountBadge: document.querySelector("#appDetailAppCountBadge"),
  appDetailAppPanelButton: document.querySelector("#appDetailAppPanelButton"),
  appDetailVersionPanelButton: document.querySelector("#appDetailVersionPanelButton"),
  appDetailPanelBackdrop: document.querySelector("#appDetailPanelBackdrop"),
  appDetailAppPanel: document.querySelector("#appDetailAppPanel"),
  appDetailVersionPanel: document.querySelector("#appDetailVersionPanel"),
  appDetailPanelCloseButtons: document.querySelectorAll("[data-app-detail-panel-close]"),
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
  elements.detailProjectSelect.addEventListener("change", handleDetailProjectSelectionChange);
  elements.appDetailAppSelect.addEventListener("change", handleAppDetailSelectionChange);
  elements.detailProjectPanelButton.addEventListener("click", handleOpenProjectPanel);
  elements.detailTaskPanelButton.addEventListener("click", handleOpenTaskPanel);
  elements.appDetailAppPanelButton.addEventListener("click", handleOpenAppPanel);
  elements.appDetailVersionPanelButton.addEventListener("click", handleOpenVersionPanel);
  elements.detailPanelBackdrop.addEventListener("click", closeDetailPanel);
  elements.appDetailPanelBackdrop.addEventListener("click", closeAppDetailPanel);
  elements.detailPanelCloseButtons.forEach((button) => {
    button.addEventListener("click", closeDetailPanel);
  });
  elements.appDetailPanelCloseButtons.forEach((button) => {
    button.addEventListener("click", closeAppDetailPanel);
  });
  elements.projectForm.addEventListener("submit", handleProjectFormSubmit);
  elements.projectNewButton.addEventListener("click", handleProjectNewClick);
  elements.projectArchiveButton.addEventListener("click", handleProjectArchiveToggle);
  elements.projectDeleteButton.addEventListener("click", handleProjectDelete);
  elements.tagForm.addEventListener("submit", handleTagFormSubmit);
  elements.tagResetButton.addEventListener("click", handleTagReset);
  elements.detailTagList.addEventListener("click", handleTagListClick);
  elements.taskForm.addEventListener("submit", handleTaskFormSubmit);
  elements.taskResetButton.addEventListener("click", handleTaskReset);
  elements.taskTagPicker.addEventListener("click", handleTaskTagPickerClick);
  elements.statusInput.addEventListener("change", handleTaskFormStatusChange);
  elements.taskSearchInput.addEventListener("input", handleTaskSearchInput);
  elements.taskStatusFilterInput.addEventListener("change", handleTaskFilterChange);
  elements.taskTagFilterInput.addEventListener("change", handleTaskFilterChange);
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

function handleOpenProjectPanel() {
  const currentProject = state.workspace.currentProject;

  if (!currentProject) {
    state.ui.projectFormMode = "create";
    state.ui.editingProjectId = null;
  } else if (state.ui.projectFormMode !== "create") {
    state.ui.projectFormMode = "edit";
    state.ui.editingProjectId = currentProject.id;
  }

  state.ui.activeDetailPanel = "project";
  render();

  window.requestAnimationFrame(() => {
    if (typeof elements.projectNameInput.focus === "function" && !elements.projectNameInput.disabled) {
      elements.projectNameInput.focus();
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

  if (activePanel === "project") {
    state.ui.editingTagId = null;
    if (state.workspace.currentProject) {
      state.ui.projectFormMode = "edit";
      state.ui.editingProjectId = state.workspace.currentProject.id;
    } else {
      state.ui.projectFormMode = "create";
      state.ui.editingProjectId = null;
    }
  }

  if (activePanel === "task") {
    state.ui.editingTaskId = null;
  }

  state.ui.activeDetailPanel = null;
  render();
}

function handleGlobalKeydown(event) {
  if (event.key !== "Escape") {
    return;
  }

  if (state.ui.activeDetailPanel) {
    closeDetailPanel();
  }

  if (state.ui.activeAppDetailPanel) {
    closeAppDetailPanel();
  }
}

async function setCurrentProject(projectId, options = {}) {
  const { nextTool = null, silent = false, preserveProjectCreateMode = false } = options;
  const previousProjectId = state.workspace.currentProjectId;

  if (state.workspace.mode === "cloud") {
    await loadCloudWorkspace({
      projectId,
      silent,
      preserveProjectCreateMode,
    });
  } else {
    state.guestWorkspace.currentProjectId = projectId;
    persistGuestWorkspace();
    syncGuestView(projectId, { preserveProjectCreateMode });
  }

  if (projectId && projectId !== previousProjectId) {
    state.ui.editingTagId = null;
    state.ui.editingTaskId = null;
    state.ui.expandedTaskRecordIds = [];
    state.ui.selectedTaskIds = [];
    resetTaskDetailFilters();
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
      appId,
      silent,
      preserveAppCreateMode,
    });
  } else {
    state.guestWorkspace.currentAppId = appId;
    persistGuestWorkspace();
    syncGuestAppView(appId, { preserveAppCreateMode });
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
  state.ui.projectFormMode = "create";
  state.ui.editingProjectId = null;
  state.ui.editingTagId = null;
  state.ui.activeDetailPanel = "project";
  render();
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
        await loadCloudWorkspace({ projectId: response.project?.id || null });
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
      await loadCloudWorkspace({ projectId });
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
          workspace.tasks = [];
        } else {
          workspace.projects.unshift(project);
        }
        workspace.currentProjectId = project.id;
      });

      state.ui.projectFormMode = "edit";
      state.ui.editingProjectId = project.id;
      state.ui.editingTaskId = null;
      syncGuestView(project.id);
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
      await loadCloudWorkspace({ projectId: currentProject.id });
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
    }

    render();
    showToast(currentProject.archived ? "项目已恢复" : "项目已归档");
  } catch (error) {
    showToast(error.message);
  }
}

async function handleProjectDelete() {
  const currentProject = state.workspace.currentProject;
  if (!currentProject || state.ui.projectFormMode === "create") {
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
      await loadCloudWorkspace();
    } else {
      updateGuestWorkspace((workspace) => {
        workspace.projects = workspace.projects.filter(
          (project) => project.id !== currentProject.id
        );
        workspace.tags = workspace.tags.filter((tag) => tag.projectId !== currentProject.id);
        workspace.tasks = workspace.tasks.filter(
          (task) => task.projectId !== currentProject.id
        );
        if (workspace.currentProjectId === currentProject.id) {
          workspace.currentProjectId = null;
        }
      });
      state.ui.editingTaskId = null;
      state.ui.projectFormMode = "edit";
      syncGuestView();
    }

    render();
    showToast("项目已删除");
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
        const response = await apiRequest("/api/apps", {
          method: "POST",
          body: payload,
        });
        state.ui.appFormMode = "edit";
        state.ui.editingAppId = response.app?.id || null;
        state.ui.editingVersionId = null;
        await loadCloudAppWorkspace({ appId: response.app?.id || null });
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
      await loadCloudAppWorkspace({ appId });
      render();
      showToast("App 已保存");
      return;
    }

    if (isCreateMode) {
      const app = createGuestAppRecord(payload);
      updateGuestWorkspace((workspace) => {
        workspace.apps.unshift(app);
        workspace.currentAppId = app.id;
      });

      state.ui.appFormMode = "edit";
      state.ui.editingAppId = app.id;
      state.ui.editingVersionId = null;
      syncGuestAppView(app.id);
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
    syncGuestAppView(appId);
    render();
    showToast("App 已保存");
  } catch (error) {
    showToast(error.message);
  }
}

async function handleAppArchiveToggle() {
  const currentApp = state.appWorkspace.currentApp;
  if (!currentApp || state.ui.appFormMode === "create") {
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
      await loadCloudAppWorkspace({ appId: currentApp.id });
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
      syncGuestAppView(currentApp.id);
    }

    render();
    showToast(currentApp.archived ? "App 已恢复" : "App 已归档");
  } catch (error) {
    showToast(error.message);
  }
}

async function handleAppDelete() {
  const currentApp = state.appWorkspace.currentApp;
  if (!currentApp || state.ui.appFormMode === "create") {
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
      await loadCloudAppWorkspace();
    } else {
      updateGuestWorkspace((workspace) => {
        workspace.apps = workspace.apps.filter((app) => app.id !== currentApp.id);
        workspace.versions = workspace.versions.filter(
          (version) => version.appId !== currentApp.id
        );
        if (workspace.currentAppId === currentApp.id) {
          workspace.currentAppId = null;
        }
      });
      state.ui.editingVersionId = null;
      state.ui.appFormMode = "edit";
      syncGuestAppView();
    }

    render();
    showToast("App 已删除");
  } catch (error) {
    showToast(error.message);
  }
}

async function handleVersionFormSubmit(event) {
  event.preventDefault();

  const currentApp = state.appWorkspace.currentApp;
  if (!currentApp) {
    showToast("请先创建或选择 App");
    return;
  }

  const versionName = elements.versionNameInput.value.trim();
  if (!versionName) {
    showToast("请输入版本号");
    return;
  }

  const payload = {
    versionName,
    buildNumber: elements.buildNumberInput.value.trim(),
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
        await apiRequest(`/api/apps/${currentApp.id}/versions`, {
          method: "POST",
          body: payload,
        });
      }

      state.ui.editingVersionId = null;
      if (!editingVersionId) {
        state.ui.activeAppDetailPanel = null;
      }
      await loadCloudAppWorkspace({ appId: currentApp.id });
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
    syncGuestAppView(currentApp.id);
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
  const currentApp = state.appWorkspace.currentApp;
  const versionIds = state.ui.selectedVersionIds.filter((versionId) =>
    state.appWorkspace.versions.some((version) => version.id === versionId)
  );
  const status = elements.bulkVersionStatusInput.value;

  if (!currentApp) {
    showToast("请先选择 App");
    return;
  }

  if (!versionIds.length) {
    showToast("请先勾选版本");
    return;
  }

  try {
    if (state.appWorkspace.mode === "cloud") {
      await apiRequest(`/api/apps/${currentApp.id}/versions`, {
        method: "PATCH",
        body: {
          versionIds,
          status,
        },
      });
      await loadCloudAppWorkspace({ appId: currentApp.id });
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
      syncGuestAppView(currentApp.id);
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

  if (actionButton.dataset.versionAction !== "delete") {
    return;
  }

  const version = state.appWorkspace.versions.find((item) => item.id === versionId);
  if (!version) {
    showToast("版本不存在");
    return;
  }

  if (!window.confirm(`确认删除版本“${version.versionName}”吗？`)) {
    return;
  }

  try {
    if (state.appWorkspace.mode === "cloud") {
      await apiRequest(`/api/app-versions/${versionId}`, {
        method: "DELETE",
      });
      await loadCloudAppWorkspace({ appId: state.appWorkspace.currentAppId });
    } else {
      updateGuestWorkspace((workspace) => {
        workspace.versions = workspace.versions.filter((item) => item.id !== versionId);
        touchGuestApp(workspace, version.appId, new Date().toISOString());
      });
      syncGuestAppView(state.appWorkspace.currentAppId);
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
      await loadCloudAppWorkspace({ appId: state.appWorkspace.currentAppId });
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
      syncGuestAppView(state.appWorkspace.currentAppId);
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
    await Promise.all([
      loadCloudWorkspace(options),
      loadCloudAppWorkspace({
        appId: options.appId || state.appWorkspace.currentAppId,
        silent: options.silent,
        preserveAppCreateMode: options.preserveAppCreateMode,
      }),
    ]);
    return;
  }

  syncGuestView(options.projectId, options);
  syncGuestAppView(options.appId, options);
}

async function loadCloudWorkspace(options = {}) {
  const {
    projectId = null,
    silent = false,
    preserveProjectCreateMode = false,
  } = options;

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
    appId = null,
    silent = false,
    preserveAppCreateMode = false,
  } = options;

  try {
    const [appsResponse, overviewResponse] = await Promise.all([
      apiRequest("/api/apps"),
      apiRequest("/api/apps/overview"),
    ]);
    const apps = Array.isArray(appsResponse.apps) ? sortProjects(appsResponse.apps) : [];
    const overview = normalizeAppOverviewPayload(overviewResponse);
    const selectedApp = resolveSelectedProject(apps, appId || state.appWorkspace.currentAppId);

    if (!selectedApp) {
      state.appWorkspace = {
        ...createEmptyAppWorkspaceView("cloud"),
        apps,
        overview,
      };
      syncAppEditorStateAfterWorkspaceSync({ preserveAppCreateMode });
      return;
    }

    const board = await apiRequest(`/api/apps/${selectedApp.id}/board`);
    const boardApps = Array.isArray(board.apps) ? sortProjects(board.apps) : apps;

    state.appWorkspace = {
      mode: "cloud",
      apps: boardApps,
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
  const { preserveAppCreateMode = false } = options;

  state.guestWorkspace = normalizeGuestWorkspace(state.guestWorkspace);

  const apps = sortProjects(state.guestWorkspace.apps);
  const currentApp =
    apps.find((app) => app.id === preferredAppId) ||
    apps.find((app) => app.id === state.guestWorkspace.currentAppId) ||
    apps.find((app) => !app.archived) ||
    apps[0] ||
    null;

  state.guestWorkspace.currentAppId = currentApp ? currentApp.id : null;

  state.appWorkspace = {
    mode: "guest",
    apps,
    currentAppId: currentApp ? currentApp.id : null,
    currentApp,
    versions: currentApp
      ? state.guestWorkspace.versions.filter((version) => version.appId === currentApp.id)
      : [],
    overview: buildGuestAppWorkspaceOverview(state.guestWorkspace),
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
  renderOverview();
  renderDetails();
  renderAppOverview();
  renderAppDetails();
  renderAuth();
  renderDataTools();
  renderUtilities();
  renderSyncPanel();
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

  if (state.ui.activeTool === "app-overview") {
    elements.toolboxProjectName.textContent = "版本总览";
    elements.toolboxProjectMeta.textContent = `当前共有 ${appOverviewTotals.appCount} 个 App、${appOverviewTotals.versionCount} 个版本。${activeTool.description}`;
    return;
  }

  if (state.ui.activeTool === "app-details") {
    elements.toolboxProjectName.textContent = currentApp ? currentApp.name : "版本详情";
    elements.toolboxProjectMeta.textContent = currentApp
      ? `当前 App 共有 ${state.appWorkspace.versions.length} 个版本，创建于 ${formatDateTime(
          currentApp.createdAt
        )}。${activeTool.description}`
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

  switch (action) {
    case "refresh-workspace":
      return state.auth.loading || state.auth.submitting;
    case "open-current-project":
      return !currentProject;
    case "copy-workspace-summary":
      return state.workspace.projects.length === 0 && state.appWorkspace.apps.length === 0;
    case "copy-project-summary":
      return !currentProject;
    case "copy-pending-tasks":
      return !currentProject || pendingTaskCount === 0;
    case "copy-project-json":
      return !currentProject;
    case "export-workspace":
      return state.workspace.projects.length === 0 && state.appWorkspace.apps.length === 0;
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

function renderDetails() {
  const projects = state.workspace.projects;
  const currentProject = state.workspace.currentProject;
  const isProjectCreateMode =
    state.ui.projectFormMode === "create" || !currentProject || !state.ui.editingProjectId;

  elements.detailProjectCountBadge.textContent = `${projects.length} 个项目`;
  elements.detailProjectSelect.innerHTML = buildProjectOptions(projects, "暂无项目");
  elements.detailProjectSelect.value = currentProject?.id || "";
  elements.detailProjectSelect.disabled = !projects.length;

  elements.projectIdInput.value = isProjectCreateMode ? "" : currentProject?.id || "";
  elements.projectNameInput.value = isProjectCreateMode ? "" : currentProject?.name || "";
  elements.projectColorInput.value = isProjectCreateMode
    ? currentProject?.color || "#c16b39"
    : currentProject?.color || "#c16b39";
  elements.projectDescriptionInput.value = isProjectCreateMode
    ? ""
    : currentProject?.description || "";
  elements.projectSubmitButton.textContent = isProjectCreateMode ? "创建项目" : "保存项目";
  elements.projectArchiveButton.textContent = currentProject?.archived
    ? "取消归档"
    : "归档项目";
  elements.projectArchiveButton.disabled = !currentProject || isProjectCreateMode;
  elements.projectDeleteButton.disabled = !currentProject || isProjectCreateMode;

  if (!currentProject) {
    elements.projectFormCopy.textContent = "当前没有项目，先创建一个项目作为任务容器。";
  } else if (isProjectCreateMode) {
    elements.projectFormCopy.textContent = `正在创建新项目。当前任务列表仍显示项目“${currentProject.name}”的内容。`;
  } else {
    elements.projectFormCopy.textContent = `当前正在编辑项目“${currentProject.name}”，可以修改项目名称、颜色和说明。`;
  }

  renderTagManager();
  renderTaskEditor();
  renderTaskFilterControls();
  renderTaskListPanel();
  renderDetailPanels();
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
  const isProjectPanelOpen = activePanel === "project";
  const isTaskPanelOpen = activePanel === "task";
  const isPanelOpen = Boolean(activePanel);

  document.body.classList.toggle(
    "detail-panel-open",
    isPanelOpen || Boolean(state.ui.activeTool === "app-details" && state.ui.activeAppDetailPanel)
  );
  elements.detailPanelBackdrop.hidden = !isPanelOpen;
  elements.detailProjectPanel.hidden = !isProjectPanelOpen;
  elements.detailTaskPanel.hidden = !isTaskPanelOpen;
  elements.detailProjectPanel.setAttribute("aria-hidden", String(!isProjectPanelOpen));
  elements.detailTaskPanel.setAttribute("aria-hidden", String(!isTaskPanelOpen));
  elements.detailProjectPanelButton.setAttribute("aria-expanded", String(isProjectPanelOpen));
  elements.detailTaskPanelButton.setAttribute("aria-expanded", String(isTaskPanelOpen));
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
    return createEmptyInlineMarkup("当前项目还没有标签，可先在项目管理面板中创建");
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

  if (!appSummaries.length) {
    elements.appVersionOverviewList.innerHTML = createEmptyStateMarkup(
      "还没有 App",
      "先到版本详情页创建应用，然后再回来查看整体发布分布。"
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
                            <strong>${escapeHtml(version.versionName || "未命名版本")}</strong>
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
  const apps = state.appWorkspace.apps;
  const currentApp = state.appWorkspace.currentApp;
  const isAppCreateMode =
    state.ui.appFormMode === "create" || !currentApp || !state.ui.editingAppId;

  elements.appDetailAppCountBadge.textContent = `${apps.length} 个 App`;
  elements.appDetailAppSelect.innerHTML = buildProjectOptions(apps, "暂无 App");
  elements.appDetailAppSelect.value = currentApp?.id || "";
  elements.appDetailAppSelect.disabled = !apps.length;

  elements.appIdInput.value = isAppCreateMode ? "" : currentApp?.id || "";
  elements.appNameInput.value = isAppCreateMode ? "" : currentApp?.name || "";
  elements.appColorInput.value = currentApp?.color || "#245a73";
  elements.appPlatformInput.value = currentApp?.platform || "ios";
  elements.appBundleIdInput.value = isAppCreateMode ? "" : currentApp?.bundleId || "";
  elements.appDescriptionInput.value = isAppCreateMode ? "" : currentApp?.description || "";
  elements.appSubmitButton.textContent = isAppCreateMode ? "创建 App" : "保存 App";
  elements.appArchiveButton.textContent = currentApp?.archived ? "取消归档" : "归档 App";
  elements.appArchiveButton.disabled = !currentApp || isAppCreateMode;
  elements.appDeleteButton.disabled = !currentApp || isAppCreateMode;

  if (!currentApp) {
    elements.appFormCopy.textContent = "当前没有 App，先创建一个应用作为版本容器。";
  } else if (isAppCreateMode) {
    elements.appFormCopy.textContent = `正在创建新 App。当前版本列表仍显示应用“${currentApp.name}”的内容。`;
  } else {
    elements.appFormCopy.textContent = `当前正在编辑 App “${currentApp.name}”，可以修改平台、颜色、标识和说明。`;
  }

  renderVersionEditor();
  renderVersionFilterControls();
  renderVersionListPanel();
  renderAppDetailPanels();
}

function renderVersionEditor() {
  const currentApp = state.appWorkspace.currentApp;
  const versions = sortVersionsForDisplay(state.appWorkspace.versions);
  const editingVersion =
    versions.find((version) => version.id === state.ui.editingVersionId) || null;

  elements.versionEditorModeBadge.textContent = editingVersion ? "编辑版本" : "新版本";
  elements.versionAppHint.textContent = currentApp
    ? `当前 App：${currentApp.name}。这里可以维护版本号、渠道、状态、优先级、日期和发布备注。`
    : "请先通过“App 管理”创建或选择 App，再在这里录入版本。";
  elements.versionIdInput.value = editingVersion?.id || "";
  elements.versionNameInput.value = editingVersion?.versionName || "";
  elements.buildNumberInput.value = editingVersion?.buildNumber || "";
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

  document.body.classList.toggle(
    "detail-panel-open",
    isPanelOpen || Boolean(state.ui.activeTool === "details" && state.ui.activeDetailPanel)
  );
  elements.appDetailPanelBackdrop.hidden = !isPanelOpen;
  elements.appDetailAppPanel.hidden = !isAppPanelOpen;
  elements.appDetailVersionPanel.hidden = !isVersionPanelOpen;
  elements.appDetailAppPanel.setAttribute("aria-hidden", String(!isAppPanelOpen));
  elements.appDetailVersionPanel.setAttribute("aria-hidden", String(!isVersionPanelOpen));
  elements.appDetailAppPanelButton.setAttribute("aria-expanded", String(isAppPanelOpen));
  elements.appDetailVersionPanelButton.setAttribute("aria-expanded", String(isVersionPanelOpen));
}

function renderVersionFilterControls() {
  const currentApp = state.appWorkspace.currentApp;

  elements.versionSearchInput.value = state.ui.versionDetailSearch;
  elements.versionStatusFilterInput.value = state.ui.versionDetailStatusFilter;
  elements.versionChannelFilterInput.value = state.ui.versionDetailChannelFilter;
  elements.versionSearchInput.disabled = !currentApp;
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
    : "这里会列出当前 App 的全部版本、状态和发布时间信息。";

  if (!currentApp) {
    elements.versionDetailList.innerHTML = createEmptyStateMarkup(
      "还没有 App",
      "先通过“App 管理”创建应用，然后再在这里查看和维护版本。"
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
            <h3>${escapeHtml(version.versionName || "未命名版本")}</h3>
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
    ? "当前账号会话已建立，任务管理、App 版本管理、数据工具和总览都会直接连接云端工作区。"
    : "当前未登录，任务管理和 App 版本管理会使用浏览器本地游客工作区。登录后将切换到账号云端。";

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
  elements.dataAppCount.textContent = String(state.appWorkspace.apps.length);
  elements.dataVersionCount.textContent = String(state.appWorkspace.versions.length);
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
    guestSummary.projectCount > 0 || guestSummary.appCount > 0
      ? `浏览器本地还保留 ${guestSummary.projectCount} 个游客项目、${guestSummary.taskCount} 项任务、${guestSummary.tagCount} 个标签，以及 ${guestSummary.appCount} 个 App、${guestSummary.versionCount} 个版本。`
      : "浏览器本地没有额外游客数据，当前仅保留默认本地收件箱占位。";
  const projectMessage = currentProject
    ? `当前项目“${currentProject.name}”可用于导出和清空已完成任务；工作区导出会同时带上 App 版本数据。`
    : state.appWorkspace.apps.length > 0
      ? "当前还没有任务项目；如果现在只管理 App 版本，可直接使用工作区导出。"
      : "请先导入 JSON、载入示例数据，或先创建任务项目与 App。";

  elements.dataGuestSummary.textContent = `${workspaceMessage}${guestMessage}${projectMessage}`;
}

function renderUtilities() {
  const currentProject = state.workspace.currentProject;
  const tasks = sortTasksForDisplay(state.workspace.tasks);
  const pendingTasks = tasks.filter((task) => task.status !== "done");
  const modeLabel = state.workspace.mode === "cloud" ? "云端账号模式" : "游客本地模式";
  const totalApps = state.appWorkspace.apps.length;
  const totalVersions = state.appWorkspace.overview?.totals?.versionCount || 0;

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
    ? `当前工作在${modeLabel}下，项目“${currentProject.name}”共有 ${tasks.length} 项任务，其中 ${pendingTasks.length} 项仍未完成；整个工作区另外还包含 ${totalApps} 个 App、${totalVersions} 个版本。这里可以直接执行高频快捷操作。`
    : `当前工作在${modeLabel}下，但还没有选中项目。当前工作区仍包含 ${totalApps} 个 App、${totalVersions} 个版本，可以先去任务详情或版本详情建立内容，再回来使用复制和导出工具。`;
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

  elements.syncMessage.textContent = `检测到浏览器本地仍有 ${guestSummary.projectCount} 个游客项目、${guestSummary.taskCount} 项任务、${guestSummary.tagCount} 个标签，以及 ${guestSummary.appCount} 个 App、${guestSummary.versionCount} 个版本。导入会显式写入当前账号，不会自动覆盖本地副本。`;
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
  const projectSummaries = projects.map((project) => {
    const projectTasks = tasksByProjectId.get(project.id) || [];
    const summary = summarizeTasks(projectTasks);

    totals.taskCount += summary.taskCount;
    totals.todoCount += summary.todoCount;
    totals.doingCount += summary.doingCount;
    totals.reviewCount += summary.reviewCount;
    totals.doneCount += summary.doneCount;

    return {
      ...project,
      ...summary,
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

function buildGuestAppWorkspaceOverview(workspace) {
  const normalizedWorkspace = normalizeGuestWorkspace(workspace);
  const apps = sortProjects(normalizedWorkspace.apps);
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

  const [projectPayloads, appPayloads] = await Promise.all([
    Promise.all(state.workspace.projects.map((project) => buildProjectExportPayload(project.id))),
    Promise.all(state.appWorkspace.apps.map((app) => buildAppExportPayload(app.id))),
  ]);

  return {
    source: "task-atlas",
    version: 3,
    scope: "workspace",
    exportedAt: new Date().toISOString(),
    projects: projectPayloads.map((payload) => ({
      project: payload.project || {},
      tags: Array.isArray(payload.tags) ? payload.tags : [],
      tasks: Array.isArray(payload.tasks) ? payload.tasks : [],
    })),
    apps: appPayloads.map((payload) => ({
      app: payload.app || {},
      versions: Array.isArray(payload.versions) ? payload.versions : [],
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
    return apiRequest(`/api/apps/${appId}/export`);
  }

  return buildGuestAppExportPayload(state.guestWorkspace, appId);
}

async function importPayloadToCloud(payload) {
  const containsProjectData = payloadContainsProjectData(payload);
  const containsAppData = payloadContainsAppData(payload);

  if (!containsProjectData && !containsAppData) {
    throw new Error("暂不支持当前 JSON 结构");
  }

  const [projectResult, appResult] = await Promise.all([
    containsProjectData
      ? apiRequest("/api/import/json", {
          method: "POST",
          body: payload,
        })
      : Promise.resolve({ importedProjects: [], importedCount: 0 }),
    containsAppData
      ? apiRequest("/api/apps/import/json", {
          method: "POST",
          body: payload,
        })
      : Promise.resolve({ importedApps: [], importedCount: 0 }),
  ]);

  return {
    importedProject: projectResult.importedProjects?.at(-1) || null,
    importedApp: appResult.importedApps?.at(-1) || null,
    importedProjectCount: Number(projectResult.importedCount) || 0,
    importedAppCount: Number(appResult.importedCount) || 0,
  };
}

function payloadContainsProjectData(payload) {
  if (!payload || typeof payload !== "object") {
    return false;
  }

  if (payload.scope === "workspace") {
    return Array.isArray(payload.projects) && payload.projects.length > 0;
  }

  return Boolean((payload.scope === "project" || payload.project) && payload.project);
}

function payloadContainsAppData(payload) {
  if (!payload || typeof payload !== "object") {
    return false;
  }

  if (payload.scope === "workspace") {
    return Array.isArray(payload.apps) && payload.apps.length > 0;
  }

  return Boolean((payload.scope === "app" || payload.app) && payload.app);
}

function buildImportResultMessage(result) {
  const segments = [];

  if (result.importedProjectCount) {
    segments.push(`已导入 ${result.importedProjectCount} 个项目`);
  }

  if (result.importedAppCount) {
    segments.push(`已导入 ${result.importedAppCount} 个 App`);
  }

  return segments.join("，") || "导入完成";
}

function buildWorkspaceSummaryText() {
  const overview = state.workspace.overview || createEmptyOverview();
  const totals = overview.totals || createEmptyOverview().totals;
  const appOverview = state.appWorkspace.overview || createEmptyAppOverview();
  const appTotals = appOverview.totals || createEmptyAppOverview().totals;
  const currentProject = state.workspace.currentProject;
  const currentApp = state.appWorkspace.currentApp;
  const projects = Array.isArray(overview.projects) ? overview.projects : [];
  const apps = Array.isArray(appOverview.apps) ? appOverview.apps : [];
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
    `App 总数：${appTotals.appCount || 0}`,
    `活跃 App：${appTotals.activeAppCount || 0}`,
    `版本总数：${appTotals.versionCount || 0}`,
    `版本分布：待规划 ${appTotals.todoCount || 0} / 开发中 ${appTotals.doingCount || 0} / 待发布 ${
      appTotals.reviewCount || 0
    } / 已发布 ${appTotals.doneCount || 0}`,
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
        } 项任务（未开始 ${project.todoCount} / 进行中 ${project.doingCount} / 待验收 ${
          project.reviewCount
        } / 已完成 ${project.doneCount}）`
      );
    });
  }

  if (apps.length) {
    lines.push("", "App 清单：");
    apps.forEach((app, index) => {
      lines.push(
        `${index + 1}. ${app.name}${app.archived ? " [已归档]" : ""}：${
          app.versionCount
        } 个版本（待规划 ${app.todoCount} / 开发中 ${app.doingCount} / 待发布 ${
          app.reviewCount
        } / 已发布 ${app.doneCount}）`
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
  const lines = [
    `项目摘要：${currentProject.name}`,
    `生成时间：${formatDateTime(new Date().toISOString())}`,
    `项目说明：${currentProject.description || "这个项目暂时还没有补充说明。"}`,
    `项目状态：${currentProject.archived ? "已归档" : "活跃"}`,
    `标签数量：${state.workspace.tags.length}`,
    `任务总数：${summary.taskCount}`,
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

function createGuestAppRecord(payload) {
  const now = new Date().toISOString();
  return {
    id: createId(),
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

function createGuestVersionRecord(appId, payload) {
  const now = new Date().toISOString();
  const status = VERSION_STATUS_META[payload.status] ? payload.status : "todo";
  return {
    id: createId(),
    appId,
    versionName: String(payload.versionName || "").trim(),
    buildNumber: String(payload.buildNumber || "").trim(),
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

  workspace.apps = workspace.apps.map((app) =>
    app.id === appId
      ? {
          ...app,
          updatedAt: timestamp,
        }
      : app
  );
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
    appCount: workspace.apps.length,
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
  normalizedWorkspace.version = 3;
  normalizedWorkspace.importedUsers = Array.isArray(normalizedWorkspace.importedUsers)
    ? normalizedWorkspace.importedUsers.map((userId) => String(userId))
    : [];
  normalizedWorkspace.projects = Array.isArray(normalizedWorkspace.projects)
    ? normalizedWorkspace.projects.map(normalizeGuestProject)
    : [];
  normalizedWorkspace.tags = Array.isArray(normalizedWorkspace.tags)
    ? normalizedWorkspace.tags.map(normalizeGuestTag)
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

  const validProjectIds = new Set(normalizedWorkspace.projects.map((project) => project.id));
  normalizedWorkspace.tags = normalizedWorkspace.tags.filter((tag) =>
    validProjectIds.has(tag.projectId)
  );
  normalizedWorkspace.tasks = normalizedWorkspace.tasks.filter((task) =>
    validProjectIds.has(task.projectId)
  );
  const validAppIds = new Set(normalizedWorkspace.apps.map((app) => app.id));
  normalizedWorkspace.versions = normalizedWorkspace.versions.filter((version) =>
    validAppIds.has(version.appId)
  );

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
    version: 3,
    importedUsers: [],
    currentProjectId: project.id,
    currentAppId: null,
    projects: [project],
    tags: [],
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
  if (hasTaskData || hasTagData) {
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
  if (workspace.tasks.length > 0 || workspace.tags.length > 0 || workspace.apps.length > 0 || workspace.versions.length > 0) {
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
    version: 3,
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
      {
        app: {
          name: "Task Atlas Web",
          description: "Web 端版本演示数据，用于验证渠道和版本状态筛选。",
          color: "#c16b39",
          platform: "web",
          bundleId: "web.taskatlas.app",
          archived: false,
        },
        versions: [
          {
            versionName: "1.9.0",
            buildNumber: "19003",
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
  };
}

function buildGuestWorkspaceExportPayload(workspace) {
  const exportableProjects = workspace.projects.filter((project) =>
    guestProjectHasMeaningfulData(workspace, project.id)
  );

  return {
    source: "task-atlas",
    version: 3,
    scope: "workspace",
    exportedAt: new Date().toISOString(),
    projects: exportableProjects.map((project) =>
      buildGuestProjectExportPayload(workspace, project.id)
    ),
    apps: workspace.apps.map((app) => buildGuestAppExportPayload(workspace, app.id)),
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

  return {
    source: "task-atlas",
    version: 2,
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
  };
}

function buildGuestAppExportPayload(workspace, appId) {
  const app = workspace.apps.find((item) => item.id === appId);
  if (!app) {
    throw new Error("App 不存在");
  }

  const versions = workspace.versions.filter((version) => version.appId === appId);

  return {
    source: "task-atlas",
    version: 3,
    scope: "app",
    exportedAt: new Date().toISOString(),
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
    version: 3,
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
      version: 3,
      importedUsers: [],
      currentProjectId: null,
      currentAppId: null,
      projects: [],
      tags: [],
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
      payload.apps.forEach((appPayload) => {
        importAppPayloadIntoGuestWorkspace(nextWorkspace, appPayload);
      });
    }
  } else if ((payload.scope === "project" || payload.project) && payload.project) {
    importProjectPayloadIntoGuestWorkspace(nextWorkspace, payload);
  } else if ((payload.scope === "app" || payload.app) && payload.app) {
    importAppPayloadIntoGuestWorkspace(nextWorkspace, payload);
  } else {
    throw new Error("暂不支持当前 JSON 结构");
  }

  nextWorkspace.importedUsers = [];
  nextWorkspace.currentProjectId =
    nextWorkspace.projects[0]?.id || nextWorkspace.currentProjectId || null;
  nextWorkspace.currentAppId = nextWorkspace.apps[0]?.id || nextWorkspace.currentAppId || null;

  return normalizeGuestWorkspace(nextWorkspace);
}

function importProjectPayloadIntoGuestWorkspace(workspace, payload) {
  const projectData = payload.project || payload;
  const tags = Array.isArray(payload.tags) ? payload.tags : [];
  const tasks = Array.isArray(payload.tasks) ? payload.tasks : [];
  const now = new Date().toISOString();
  const projectId = createId();

  workspace.projects.unshift({
    id: projectId,
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

  workspace.currentProjectId = projectId;
}

function importAppPayloadIntoGuestWorkspace(workspace, payload) {
  const appData = payload.app || payload;
  const versions = Array.isArray(payload.versions) ? payload.versions : [];
  const now = new Date().toISOString();
  const appId = createId();

  workspace.apps.unshift({
    id: appId,
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
      versionName: String(version.versionName || "未命名版本").trim() || "未命名版本",
      buildNumber: String(version.buildNumber || "").trim(),
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
    tasks: [],
    overview: createEmptyOverview(),
  };
}

function createEmptyAppWorkspaceView(mode) {
  return {
    mode,
    apps: [],
    currentAppId: null,
    currentApp: null,
    versions: [],
    overview: createEmptyAppOverview(),
  };
}

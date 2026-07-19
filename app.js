/**
 * ZenFlow AI - Main Application Coordinator
 * Handles routing, state management, UI events, drag & drop, and view rendering.
 */

class App {
    constructor() {
        this.initializeState();
        this.cacheDOM();
        this.bindEvents();
        this.initRouter();
        this.initTimer();
        this.initDragAndDrop();
        this.renderAll();
    }

    // ==========================================
    // State Initialization
    // ==========================================
    initializeState() {
        // Default Tasks
        const defaultTasks = [
            {
                id: 'task-1',
                title: 'Design landing page mockup with glassmorphism',
                desc: 'Create high-fidelity dark UI templates highlighting glows, gradients, and custom blur components.',
                priority: 'high',
                status: 'progress',
                subtasks: [
                    { text: 'Research modern landing pages for dashboard layouts', done: true },
                    { text: 'Create wireframe outlines of top landing page folds', done: false },
                    { text: 'Establish glowing violet and glassmorphism styling guide', done: false }
                ]
            },
            {
                id: 'task-2',
                title: 'Implement dashboard analytics metrics',
                desc: 'Hook up completion ratios, focus logged hours, and automation counts to local state metrics.',
                priority: 'high',
                status: 'todo',
                subtasks: []
            },
            {
                id: 'task-3',
                title: 'Summarize client sync notes',
                desc: 'Consolidate raw notes from Tuesday meeting regarding scaling challenges and product timelines.',
                priority: 'medium',
                status: 'todo',
                subtasks: []
            },
            {
                id: 'task-4',
                title: 'Write unit tests for state actions',
                desc: 'Cover task creation, state serialization, and local storage fallback paths.',
                priority: 'low',
                status: 'review',
                subtasks: []
            }
        ];

        // Default Flows
        const defaultFlows = [
            {
                id: 'flow-1',
                title: 'Slack Sync Alerts',
                trigger: 'When a task is marked High Priority',
                action: 'Alert team channel & open Copilot panel',
                active: true,
                count: 14
            },
            {
                id: 'flow-2',
                title: 'Focus Achievement Log',
                trigger: 'When a task is marked Done',
                action: 'Trigger celebration toast & increment metrics',
                active: true,
                count: 8
            },
            {
                id: 'flow-3',
                title: 'Pomodoro Transition',
                trigger: 'When Focus Session completes',
                action: 'Schedule 5-minute break automatically',
                active: false,
                count: 0
            }
        ];

        // Load State from LocalStorage
        this.state = {
            tasks: JSON.parse(localStorage.getItem('zf_tasks')) || defaultTasks,
            flows: JSON.parse(localStorage.getItem('zf_flows')) || defaultFlows,
            focusTime: parseFloat(localStorage.getItem('zf_focus_time')) || 4.2,
            activeView: 'dashboard',
            copilotHistory: JSON.parse(localStorage.getItem('zf_copilot_history')) || [
                { role: 'ai', text: "Hello Jane! I am your ZenFlow Copilot. How can I help you automate your day or brainstorm outlines?" }
            ]
        };
    }

    saveState() {
        localStorage.setItem('zf_tasks', JSON.stringify(this.state.tasks));
        localStorage.setItem('zf_flows', JSON.stringify(this.state.flows));
        localStorage.setItem('zf_focus_time', this.state.focusTime.toString());
        localStorage.setItem('zf_copilot_history', JSON.stringify(this.state.copilotHistory));
    }

    // ==========================================
    // DOM Element Caching
    // ==========================================
    cacheDOM() {
        this.dom = {
            navItems: document.querySelectorAll('.nav-item'),
            viewSections: document.querySelectorAll('.view-section'),
            copilotPanel: document.getElementById('copilot-panel'),
            btnToggleCopilot: document.getElementById('btn-toggle-copilot'),
            btnOpenCopilotFloating: document.getElementById('btn-open-copilot-floating'),
            copilotMsgList: document.getElementById('copilot-msg-list'),
            copilotTextInput: document.getElementById('copilot-text-input'),
            btnSendCopilot: document.getElementById('btn-send-copilot'),
            
            // Dashboard Elements
            dashboardTasksCompleted: document.getElementById('dashboard-tasks-completed'),
            dashboardFocusHours: document.getElementById('dashboard-focus-hours'),
            dashboardActiveFlows: document.getElementById('dashboard-active-flows'),
            dashboardSuggestionList: document.getElementById('dashboard-suggestion-list'),
            dashboardTriggerFlow: document.getElementById('dashboard-trigger-flow'),
            dashboardGoFocus: document.getElementById('dashboard-go-focus'),
            
            // Task board Elements
            btnOpenAddTask: document.getElementById('btn-open-add-task'),
            btnOptimizePriorities: document.getElementById('btn-optimize-priorities'),
            taskSearchInput: document.getElementById('task-search-input'),
            columns: {
                todo: document.getElementById('list-todo'),
                progress: document.getElementById('list-progress'),
                review: document.getElementById('list-review'),
                done: document.getElementById('list-done')
            },
            counts: {
                todo: document.getElementById('count-todo'),
                progress: document.getElementById('count-progress'),
                review: document.getElementById('count-review'),
                done: document.getElementById('count-done')
            },

            // Modals
            modalTask: document.getElementById('modal-task'),
            modalTaskClose: document.getElementById('modal-task-close'),
            modalTaskCancel: document.getElementById('modal-task-cancel'),
            modalTaskSave: document.getElementById('modal-task-save'),
            taskInputTitle: document.getElementById('task-input-title'),
            taskInputDesc: document.getElementById('task-input-desc'),
            taskInputPriority: document.getElementById('task-input-priority'),
            taskInputStatus: document.getElementById('task-input-status'),
            
            modalSubtasks: document.getElementById('modal-subtasks'),
            modalSubtasksClose: document.getElementById('modal-subtasks-close'),
            modalSubtasksCloseBtn: document.getElementById('modal-subtasks-close-btn'),
            btnDecomposeAI: document.getElementById('btn-decompose-ai'),
            subtaskParentTitle: document.getElementById('subtask-parent-title'),
            subtaskParentDesc: document.getElementById('subtask-parent-desc'),
            subtasksListContainer: document.getElementById('subtasks-list-container'),

            // Timer Elements
            timerDisplay: document.getElementById('timer-display'),
            timerMode: document.getElementById('timer-mode'),
            timerProgressBar: document.getElementById('timer-progress-bar'),
            btnTimerToggle: document.getElementById('btn-timer-toggle'),
            timerToggleIcon: document.getElementById('timer-toggle-icon'),
            timerToggleText: document.getElementById('timer-toggle-text'),
            btnTimerReset: document.getElementById('btn-timer-reset'),
            aiQuote: document.getElementById('ai-quote'),
            aiQuoteAuthor: document.getElementById('ai-quote-author'),
            btnGenerateQuote: document.getElementById('btn-generate-quote'),
            soundCards: document.querySelectorAll('.sound-card'),

            // Meeting Elements
            meetingRawText: document.getElementById('meeting-raw-text'),
            btnLoadSampleTranscript: document.getElementById('btn-load-sample-transcript'),
            btnSummarizeMeeting: document.getElementById('btn-summarize-meeting'),
            meetingOutputTabs: document.querySelectorAll('.output-tab'),
            meetingOutputContents: document.querySelectorAll('.tab-content'),
            summaryOutput: document.getElementById('summary-output'),
            actionsOutput: document.getElementById('actions-output'),
            mindmapOutput: document.getElementById('mindmap-output'),

            // Flows view Elements
            flowContainerList: document.getElementById('flow-container-list'),
            btnCreateFlow: document.getElementById('btn-create-flow'),

            // Settings Elements
            inputApiKey: document.getElementById('input-api-key'),
            btnSaveKey: document.getElementById('btn-save-key'),
            apiStatusDot: document.getElementById('api-status-dot'),
            apiStatusText: document.getElementById('api-status-text'),
            selectTheme: document.getElementById('select-theme'),
            btnResetData: document.getElementById('btn-reset-data'),
            
            toastContainer: document.getElementById('toast-container')
        };
    }

    // ==========================================
    // Event Bindings
    // ==========================================
    bindEvents() {
        // Navigation clicks
        this.dom.navItems.forEach(item => {
            item.addEventListener('click', (e) => {
                e.preventDefault();
                const view = item.getAttribute('data-view');
                this.switchView(view);
            });
        });

        // AI Copilot Toggle Panels
        this.dom.btnToggleCopilot.addEventListener('click', () => this.toggleCopilot(false));
        this.dom.btnOpenCopilotFloating.addEventListener('click', () => this.toggleCopilot(true));
        
        // AI Copilot Send Message
        this.dom.btnSendCopilot.addEventListener('click', () => this.handleCopilotSend());
        this.dom.copilotTextInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') this.handleCopilotSend();
        });

        // Dashboard Go-To actions
        this.dom.dashboardTriggerFlow.addEventListener('click', () => {
            this.showToast('Workspace AI Sync', 'Recalculating completion rates and re-analyzing action triggers...');
            this.renderSuggestions();
        });
        this.dom.dashboardGoFocus.addEventListener('click', () => this.switchView('focus'));

        // Tasks View Actions
        this.dom.btnOpenAddTask.addEventListener('click', () => this.openTaskModal());
        this.dom.modalTaskClose.addEventListener('click', () => this.closeTaskModal());
        this.dom.modalTaskCancel.addEventListener('click', () => this.closeTaskModal());
        this.dom.modalTaskSave.addEventListener('click', () => this.handleSaveTask());
        this.dom.btnOptimizePriorities.addEventListener('click', () => this.handleOptimizePriorities());
        this.dom.taskSearchInput.addEventListener('input', () => this.renderTasks());

        // Subtasks AI decompose actions
        this.dom.modalSubtasksClose.addEventListener('click', () => this.closeSubtaskModal());
        this.dom.modalSubtasksCloseBtn.addEventListener('click', () => this.closeSubtaskModal());
        this.dom.btnDecomposeAI.addEventListener('click', () => this.handleAIDecompose());

        // Focus Timer Actions
        this.dom.btnTimerToggle.addEventListener('click', () => this.toggleTimer());
        this.dom.btnTimerReset.addEventListener('click', () => this.resetTimer());
        this.dom.btnGenerateQuote.addEventListener('click', () => this.generateAIQuote());
        this.setupSounds();

        // Meeting Summarizer Actions
        this.dom.btnLoadSampleTranscript.addEventListener('click', () => this.loadSampleMeetingText());
        this.dom.btnSummarizeMeeting.addEventListener('click', () => this.handleSummarizeMeeting());
        this.dom.meetingOutputTabs.forEach(tab => {
            tab.addEventListener('click', () => {
                this.dom.meetingOutputTabs.forEach(t => t.classList.remove('active'));
                tab.classList.add('active');
                
                const target = tab.getAttribute('data-tab');
                this.dom.meetingOutputContents.forEach(content => {
                    if (content.id === `tab-${target}`) {
                        content.classList.add('active');
                    } else {
                        content.classList.remove('active');
                    }
                });
            });
        });

        // Flows Builder actions
        this.dom.btnCreateFlow.addEventListener('click', () => {
            const flowName = prompt("Enter a description for your custom flow (e.g. 'When task review exceeds 2 hours, auto-assign Alex')");
            if (flowName) {
                const newFlow = {
                    id: `flow-${Date.now()}`,
                    title: 'Custom Automation Rule',
                    trigger: flowName,
                    action: 'AI agent executes workflow script',
                    active: true,
                    count: 0
                };
                this.state.flows.push(newFlow);
                this.saveState();
                this.renderFlows();
                this.showToast('New Flow Active', 'Custom flow trigger registered in ZenFlow workspace.');
            }
        });

        // Settings Actions
        this.dom.btnSaveKey.addEventListener('click', () => {
            const key = this.dom.inputApiKey.value.trim();
            window.AI.setApiKey(key);
            this.updateApiStatusIndicator();
            this.showToast('Settings Saved', key ? 'Gemini API connection set to Live.' : 'Gemini set back to Demo simulation mode.');
        });
        this.dom.selectTheme.addEventListener('change', (e) => {
            document.documentElement.setAttribute('data-theme', e.target.value);
            localStorage.setItem('zf_theme', e.target.value);
        });
        this.dom.btnResetData.addEventListener('click', () => {
            if (confirm("Reset all workspace tasks, flow metrics, and API keys?")) {
                localStorage.clear();
                this.initializeState();
                window.AI.setApiKey('');
                this.updateApiStatusIndicator();
                this.dom.inputApiKey.value = '';
                this.renderAll();
                this.showToast('Workspace Reset', 'All configurations set to demo default states.');
            }
        });
    }

    // ==========================================
    // Client-side Router
    // ==========================================
    initRouter() {
        const hash = window.location.hash.replace('#', '');
        if (hash) {
            this.switchView(hash);
        } else {
            this.switchView('dashboard');
        }
        
        window.addEventListener('hashchange', () => {
            const currentHash = window.location.hash.replace('#', '');
            if (currentHash) this.switchView(currentHash);
        });
    }

    switchView(viewId) {
        if (!['dashboard', 'tasks', 'focus', 'meeting', 'flows', 'settings'].includes(viewId)) return;
        
        this.state.activeView = viewId;
        
        // Update nav UI active class
        this.dom.navItems.forEach(item => {
            if (item.getAttribute('data-view') === viewId) {
                item.classList.add('active');
            } else {
                item.classList.remove('active');
            }
        });

        // Hide/Show section panels
        this.dom.viewSections.forEach(section => {
            if (section.id === `view-${viewId}`) {
                section.classList.remove('hidden');
            } else {
                section.classList.add('hidden');
            }
        });

        // Perform view-specific load setups
        if (viewId === 'dashboard') {
            this.renderDashboard();
        } else if (viewId === 'tasks') {
            this.renderTasks();
        } else if (viewId === 'flows') {
            this.renderFlows();
        } else if (viewId === 'settings') {
            this.dom.inputApiKey.value = window.AI.apiKey || '';
            this.updateApiStatusIndicator();
            const theme = localStorage.getItem('zf_theme') || 'dark';
            this.dom.selectTheme.value = theme;
        }

        lucide.createIcons();
    }

    // ==========================================
    // Render Controllers
    // ==========================================
    renderAll() {
        this.renderDashboard();
        this.renderTasks();
        this.renderFlows();
        this.renderCopilotMessages();
        
        // Initial Theme check
        const theme = localStorage.getItem('zf_theme') || 'dark';
        document.documentElement.setAttribute('data-theme', theme);
        this.dom.selectTheme.value = theme;
        
        lucide.createIcons();
    }

    renderDashboard() {
        // Metrics
        const completed = this.state.tasks.filter(t => t.status === 'done').length;
        const total = this.state.tasks.length;
        this.dom.dashboardTasksCompleted.textContent = `${completed}/${total}`;
        this.dom.dashboardFocusHours.textContent = `${this.state.focusTime.toFixed(1)} hrs`;
        this.dom.dashboardActiveFlows.textContent = this.state.flows.filter(f => f.active).length.toString();
        
        this.renderSuggestions();
    }

    async renderSuggestions() {
        this.dom.dashboardSuggestionList.innerHTML = `<div style="padding:20px;text-align:center;color:var(--text-muted);">Analyzing workspace flows...</div>`;
        const list = await window.AI.suggestActions(this.state.tasks, this.state.focusTime);
        this.dom.dashboardSuggestionList.innerHTML = '';
        
        list.forEach(sug => {
            const el = document.createElement('div');
            el.className = 'suggestion-item';
            el.innerHTML = `
                <div class="suggestion-icon ${sug.iconClass}">
                    <i data-lucide="${sug.icon}"></i>
                </div>
                <div class="suggestion-details">
                    <div class="suggestion-title">${sug.title}</div>
                    <div class="suggestion-desc">${sug.desc}</div>
                </div>
                <div class="suggestion-action">
                    <button class="btn btn-secondary btn-suggestion-run" data-type="${sug.type}" data-id="${sug.id}">${sug.actionLabel}</button>
                </div>
            `;

            // Suggestion action wiring
            el.querySelector('.btn-suggestion-run').addEventListener('click', () => {
                if (sug.type === 'optimization') {
                    this.switchView('tasks');
                    this.handleOptimizePriorities();
                } else if (sug.type === 'drafting') {
                    this.toggleCopilot(true);
                    this.dom.copilotTextInput.value = "Draft a daily status progress update email based on active tasks.";
                    this.handleCopilotSend();
                } else if (sug.type === 'suggest') {
                    this.switchView('tasks');
                    // Decompose first task
                    const uncompleted = this.state.tasks.find(t => t.subtasks.length === 0);
                    if (uncompleted) this.openSubtaskModal(uncompleted);
                }
            });

            this.dom.dashboardSuggestionList.appendChild(el);
        });
        lucide.createIcons();
    }

    renderTasks() {
        const query = this.dom.taskSearchInput.value.toLowerCase();
        
        // Clear columns
        Object.keys(this.dom.columns).forEach(status => {
            this.dom.columns[status].innerHTML = '';
        });

        // Filter and place tasks
        const filteredTasks = this.state.tasks.filter(t => 
            t.title.toLowerCase().includes(query) || 
            t.desc.toLowerCase().includes(query)
        );

        const counts = { todo: 0, progress: 0, review: 0, done: 0 };

        filteredTasks.forEach(task => {
            counts[task.status]++;
            const card = document.createElement('div');
            card.className = 'task-card';
            card.setAttribute('draggable', 'true');
            card.setAttribute('data-id', task.id);
            
            const badgeClass = task.priority === 'high' ? 'badge-high' : (task.priority === 'medium' ? 'badge-medium' : 'badge-low');
            const subtaskCount = task.subtasks.length;
            const completedSubtasks = task.subtasks.filter(st => st.done).length;
            const subtaskRatio = subtaskCount > 0 ? `• <i data-lucide="check-square" style="width:10px;height:10px;display:inline-block;vertical-align:middle;"></i> ${completedSubtasks}/${subtaskCount}` : '';

            card.innerHTML = `
                <div class="task-badge ${badgeClass}">${task.priority.toUpperCase()}</div>
                <div class="task-title">${task.title}</div>
                <div class="task-desc">${task.desc || ''}</div>
                <div class="task-meta">
                    <div>
                        <span>Subtasks ${subtaskRatio}</span>
                    </div>
                    <div class="task-actions">
                        <button class="task-action-btn btn-action-decompose" title="AI Decomposition"><i data-lucide="sparkles" style="width:14px;height:14px;"></i></button>
                        <button class="task-action-btn btn-action-delete" title="Delete Task"><i data-lucide="trash-2" style="width:14px;height:14px;"></i></button>
                    </div>
                </div>
            `;

            // Card events
            card.querySelector('.btn-action-decompose').addEventListener('click', (e) => {
                e.stopPropagation();
                this.openSubtaskModal(task);
            });
            card.querySelector('.btn-action-delete').addEventListener('click', (e) => {
                e.stopPropagation();
                this.deleteTask(task.id);
            });
            card.addEventListener('click', () => {
                this.openSubtaskModal(task);
            });

            this.dom.columns[task.status].appendChild(card);
        });

        // Set counts
        Object.keys(counts).forEach(status => {
            this.dom.counts[status].textContent = counts[status];
        });

        this.initDragAndDrop();
        lucide.createIcons();
    }

    renderFlows() {
        this.dom.flowContainerList.innerHTML = '';
        this.state.flows.forEach(flow => {
            const card = document.createElement('div');
            card.className = 'flow-card glass-card';
            card.innerHTML = `
                <div class="flow-header">
                    <div>
                        <div class="flow-title">${flow.title}</div>
                        <div style="font-size:11px;color:var(--text-muted);margin-top:2px;">Trigger runs: ${flow.count}</div>
                    </div>
                    <label class="flow-toggle">
                        <input type="checkbox" class="flow-toggle-checkbox" data-id="${flow.id}" ${flow.active ? 'checked' : ''}>
                        <span class="slider"></span>
                    </label>
                </div>
                <div class="flow-steps">
                    <div class="flow-step">
                        <i data-lucide="help-circle" style="color:var(--accent-cyan);width:16px;height:16px;"></i>
                        <span><strong>Trigger:</strong> ${flow.trigger}</span>
                    </div>
                    <div class="flow-connector"></div>
                    <div class="flow-step">
                        <i data-lucide="play-circle" style="color:var(--accent-violet);width:16px;height:16px;"></i>
                        <span><strong>Action:</strong> ${flow.action}</span>
                    </div>
                </div>
            `;

            card.querySelector('.flow-toggle-checkbox').addEventListener('change', (e) => {
                const checked = e.target.checked;
                flow.active = checked;
                this.saveState();
                this.showToast('Flow Updated', `${flow.title} automation ${checked ? 'enabled' : 'disabled'}.`);
            });

            this.dom.flowContainerList.appendChild(card);
        });
        lucide.createIcons();
    }

    // ==========================================
    // Task Board Methods
    // ==========================================
    openTaskModal() {
        this.dom.taskInputTitle.value = '';
        this.dom.taskInputDesc.value = '';
        this.dom.taskInputPriority.value = 'medium';
        this.dom.taskInputStatus.value = 'todo';
        this.dom.modalTask.style.display = 'flex';
    }

    closeTaskModal() {
        this.dom.modalTask.style.display = 'none';
    }

    handleSaveTask() {
        const title = this.dom.taskInputTitle.value.trim();
        const desc = this.dom.taskInputDesc.value.trim();
        const priority = this.dom.taskInputPriority.value;
        const status = this.dom.taskInputStatus.value;

        if (!title) {
            alert('Please enter a task title');
            return;
        }

        const newTask = {
            id: `task-${Date.now()}`,
            title,
            desc,
            priority,
            status,
            subtasks: []
        };

        this.state.tasks.push(newTask);
        this.saveState();
        this.closeTaskModal();
        this.renderTasks();
        this.checkFlowTrigger('create_task', newTask);
    }

    deleteTask(id) {
        if (confirm('Delete this task?')) {
            this.state.tasks = this.state.tasks.filter(t => t.id !== id);
            this.saveState();
            this.renderTasks();
        }
    }

    async handleOptimizePriorities() {
        this.showToast('AI Optimizing', 'Sorting tasks and balancing priorities...');
        const optimized = await window.AI.optimizePriorities(this.state.tasks);
        this.state.tasks = optimized;
        this.saveState();
        this.renderTasks();
        this.showToast('Optimization Complete', 'Board re-ordered by semantic priority.');
    }

    // ==========================================
    // AI Subtasks Management
    // ==========================================
    openSubtaskModal(task) {
        this.currentTaskForSubtasks = task;
        this.dom.subtaskParentTitle.textContent = task.title;
        this.dom.subtaskParentDesc.textContent = task.desc || 'No description provided.';
        this.renderSubtaskList();
        this.dom.modalSubtasks.style.display = 'flex';
    }

    closeSubtaskModal() {
        this.dom.modalSubtasks.style.display = 'none';
        this.currentTaskForSubtasks = null;
    }

    renderSubtaskList() {
        const task = this.currentTaskForSubtasks;
        if (!task) return;

        this.dom.subtasksListContainer.innerHTML = '';
        if (task.subtasks.length === 0) {
            this.dom.subtasksListContainer.innerHTML = `
                <div style="text-align:center;padding:12px;color:var(--text-muted);font-size:12px;">
                    No checklist items yet. Let AI break down this task!
                </div>
            `;
            return;
        }

        task.subtasks.forEach((st, idx) => {
            const div = document.createElement('div');
            div.className = 'subtask-item';
            div.innerHTML = `
                <input type="checkbox" id="chk-st-${idx}" ${st.done ? 'checked' : ''}>
                <label for="chk-st-${idx}" style="font-size:12.5px;color:${st.done ? 'var(--text-muted)' : 'var(--text-primary)'};text-decoration:${st.done ? 'line-through' : 'none'};">${st.text}</label>
            `;
            
            div.querySelector('input').addEventListener('change', (e) => {
                st.done = e.target.checked;
                this.saveState();
                this.renderTasks();
                this.renderSubtaskList();
            });

            this.dom.subtasksListContainer.appendChild(div);
        });
    }

    async handleAIDecompose() {
        const task = this.currentTaskForSubtasks;
        if (!task) return;

        this.dom.subtasksListContainer.innerHTML = `
            <div style="text-align:center;padding:12px;color:var(--text-secondary);font-size:12px;">
                Decomposing task with Generative AI...
            </div>
        `;

        try {
            const list = await window.AI.decomposeTask(task.title, task.desc);
            task.subtasks = list;
            this.saveState();
            this.renderSubtaskList();
            this.renderTasks();
            this.showToast('Decomposition Complete', `Added ${list.length} subtasks dynamically.`);
        } catch (error) {
            this.showToast('Decomposition Failed', 'Ensure API settings are correct.');
            this.renderSubtaskList();
        }
    }

    // ==========================================
    // HTML5 Drag and Drop API
    // ==========================================
    initDragAndDrop() {
        const cards = document.querySelectorAll('.task-card');
        const columns = document.querySelectorAll('.kanban-column');

        cards.forEach(card => {
            card.addEventListener('dragstart', (e) => {
                e.dataTransfer.setData('text/plain', card.getAttribute('data-id'));
                setTimeout(() => card.classList.add('hidden'), 0);
            });
            card.addEventListener('dragend', () => {
                card.classList.remove('hidden');
            });
        });

        columns.forEach(col => {
            col.addEventListener('dragover', (e) => {
                e.preventDefault();
                col.classList.add('drag-over');
            });

            col.addEventListener('dragleave', () => {
                col.classList.remove('drag-over');
            });

            col.addEventListener('drop', (e) => {
                e.preventDefault();
                col.classList.remove('drag-over');
                const id = e.dataTransfer.getData('text/plain');
                const task = this.state.tasks.find(t => t.id === id);
                const oldStatus = task.status;
                const newStatus = col.getAttribute('data-status');
                
                if (task && oldStatus !== newStatus) {
                    task.status = newStatus;
                    this.saveState();
                    this.renderTasks();
                    this.showToast('Task Shifted', `"${task.title}" moved to ${newStatus.toUpperCase()}`);
                    
                    // Automation check
                    if (newStatus === 'done') {
                        this.checkFlowTrigger('complete_task', task);
                    }
                    if (task.priority === 'high' && newStatus === 'progress') {
                        this.checkFlowTrigger('high_priority_start', task);
                    }
                }
            });
        });
    }

    // ==========================================
    // Focus Timer Logics
    // ==========================================
    initTimer() {
        this.timer = {
            duration: 25 * 60, // 25 mins
            timeLeft: 25 * 60,
            interval: null,
            isRunning: false,
            mode: 'work' // work or break
        };
        this.updateTimerDisplay();
    }

    updateTimerDisplay() {
        const minutes = Math.floor(this.timer.timeLeft / 60);
        const seconds = this.timer.timeLeft % 60;
        this.dom.timerDisplay.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        
        // Progress circle offset calculations
        const circ = 282.7; // 2 * pi * 45
        const pct = (this.timer.timeLeft / this.timer.duration);
        const offset = circ * (1 - pct);
        this.dom.timerProgressBar.style.strokeDashoffset = offset.toString();
    }

    toggleTimer() {
        if (this.timer.isRunning) {
            // Stop
            clearInterval(this.timer.interval);
            this.timer.isRunning = false;
            this.dom.timerToggleIcon.setAttribute('data-lucide', 'play');
            this.dom.timerToggleText.textContent = 'Resume Focus';
            this.stopSoundVisualizers();
        } else {
            // Start
            this.timer.isRunning = true;
            this.dom.timerToggleIcon.setAttribute('data-lucide', 'pause');
            this.dom.timerToggleText.textContent = 'Pause Session';
            this.startSoundVisualizers();
            
            this.timer.interval = setInterval(() => {
                this.timer.timeLeft--;
                this.updateTimerDisplay();
                
                if (this.timer.timeLeft <= 0) {
                    clearInterval(this.timer.interval);
                    this.timer.isRunning = false;
                    this.handleTimerCompletion();
                }
            }, 1000);
        }
        lucide.createIcons();
    }

    resetTimer() {
        clearInterval(this.timer.interval);
        this.timer.isRunning = false;
        this.timer.timeLeft = this.timer.duration;
        this.dom.timerToggleIcon.setAttribute('data-lucide', 'play');
        this.dom.timerToggleText.textContent = 'Start Focus';
        this.stopSoundVisualizers();
        this.updateTimerDisplay();
        lucide.createIcons();
    }

    handleTimerCompletion() {
        this.showToast('Timer Complete!', this.timer.mode === 'work' ? 'Sprint work block finished. Take a rest!' : 'Break session over. Let\'s work.');
        
        if (this.timer.mode === 'work') {
            this.state.focusTime += 25 / 60; // log 25 mins
            this.saveState();
            
            // Check automation triggers
            this.checkFlowTrigger('pomodoro_complete', null);
            
            // Auto switch to break if configured
            const pFlow = this.state.flows.find(f => f.id === 'flow-3');
            if (pFlow && pFlow.active) {
                pFlow.count++;
                this.saveState();
                this.timer.mode = 'break';
                this.timer.duration = 5 * 60;
                this.timer.timeLeft = 5 * 60;
                this.dom.timerMode.textContent = 'Break Time';
            } else {
                this.timer.mode = 'work';
                this.timer.duration = 25 * 60;
                this.timer.timeLeft = 25 * 60;
            }
        } else {
            this.timer.mode = 'work';
            this.timer.duration = 25 * 60;
            this.timer.timeLeft = 25 * 60;
            this.dom.timerMode.textContent = 'Work Session';
        }
        
        this.resetTimer();
    }

    setupSounds() {
        this.dom.soundCards.forEach(card => {
            const soundType = card.getAttribute('data-sound');
            const slider = card.querySelector('.sound-volume');
            const audio = document.getElementById(`audio-${soundType}`);

            slider.addEventListener('input', (e) => {
                const vol = parseInt(e.target.value);
                if (vol > 0) {
                    card.classList.add('active');
                    if (audio) {
                        audio.volume = vol / 100;
                        if (audio.paused) audio.play().catch(err => console.log('Audio wait user action', err));
                    }
                } else {
                    card.classList.remove('active');
                    if (audio) audio.pause();
                }
                
                // Active visualizers toggles
                if (this.timer.isRunning) {
                    this.startSoundVisualizers();
                }
            });
        });
    }

    startSoundVisualizers() {
        // Creates dynamic bars bouncing simulation if music volume is up
        this.dom.soundCards.forEach(card => {
            const slider = card.querySelector('.sound-volume');
            if (parseInt(slider.value) > 0) {
                let vis = card.querySelector('.audio-visualizer');
                if (!vis) {
                    vis = document.createElement('div');
                    vis.className = 'audio-visualizer';
                    vis.innerHTML = `
                        <div class="visualizer-bar"></div>
                        <div class="visualizer-bar"></div>
                        <div class="visualizer-bar"></div>
                        <div class="visualizer-bar"></div>
                        <div class="visualizer-bar"></div>
                    `;
                    card.appendChild(vis);
                }
            }
        });
    }

    stopSoundVisualizers() {
        document.querySelectorAll('.audio-visualizer').forEach(v => v.remove());
    }

    async generateAIQuote() {
        this.dom.aiQuote.textContent = "AI Coach is typing motivational guidance...";
        if (this.dom.aiQuoteAuthor) this.dom.aiQuoteAuthor.textContent = "";
        
        try {
            let quote = "";
            if (window.AI.isLiveMode) {
                quote = await window.AI.callGemini("Write a brief 1-sentence productivity affirmation for someone working or coding. Keep it under 80 characters.");
            } else {
                quote = "Focus is the art of directing energy to create the future, one keypress at a time.";
            }
            this.dom.aiQuote.textContent = `"${quote.trim().replace(/"/g, '')}"`;
            if (this.dom.aiQuoteAuthor) this.dom.aiQuoteAuthor.textContent = "ZenFlow AI Coach";
        } catch (error) {
            this.dom.aiQuote.textContent = `"Keep going! Focus is the master key to code output."`;
        }
    }

    // ==========================================
    // Meeting Summarizer Logics
    // ==========================================
    loadSampleMeetingText() {
        const transcript = `Sprint Sync - July 19
Speaker A (Jane): Hi everyone. Let's do a fast sync. We have the Q3 release coming on August 15. The design needs to look extremely premium. Jane will sign off on the dark-theme glassmorphism mockup by Wednesday so Alex can implement.
Speaker B (Alex): On the backend, we need to scale. Staging pipeline is failing. I need to code the API throttling limits to stop db locking.
Speaker A (Jane): Great. Let's make sure testing coverage remains high. We will schedule a team retro next Monday. Thanks!`;
        this.dom.meetingRawText.value = transcript;
    }

    async handleSummarizeMeeting() {
        const notes = this.dom.meetingRawText.value.trim();
        if (!notes) {
            alert("Please paste some transcript or raw notes first.");
            return;
        }

        this.dom.summaryOutput.innerHTML = `<div style="text-align:center;padding:50px;color:var(--text-secondary);">Summarizing transcript and mapping node structures...</div>`;
        this.dom.actionsOutput.innerHTML = `<div style="text-align:center;padding:50px;color:var(--text-secondary);">Extracting...</div>`;
        this.dom.mindmapOutput.innerHTML = `<div style="text-align:center;padding:50px;color:var(--text-secondary);">Structuring...</div>`;

        try {
            const data = await window.AI.summarizeMeeting(notes);
            if (!data) return;

            // Render Summary
            this.dom.summaryOutput.innerHTML = `<div class="summary-markdown">${this.parseMarkdownSimple(data.summary)}</div>`;
            
            // Render Actions
            this.dom.actionsOutput.innerHTML = '';
            const actionList = document.createElement('ul');
            actionList.style.paddingLeft = '20px';
            actionList.style.lineHeight = '1.8';
            data.actions.forEach(act => {
                const li = document.createElement('li');
                li.style.marginBottom = '8px';
                li.innerHTML = this.parseMarkdownSimple(act);
                actionList.appendChild(li);
            });
            this.dom.actionsOutput.appendChild(actionList);

            // Render Mindmap simulation
            this.dom.mindmapOutput.innerHTML = '';
            const tree = this.renderMindMapTree(data.mindmap);
            this.dom.mindmapOutput.appendChild(tree);

            this.showToast('AI Summarization Done', 'Summary tabs and discussion structure rendered successfully.');
        } catch (error) {
            this.showToast('Summarization Failed', 'API issue or invalid JSON response from Gemini.');
        }
    }

    renderMindMapTree(node) {
        const wrapper = document.createElement('div');
        wrapper.className = 'mindmap-tree';
        
        const nodeEl = document.createElement('div');
        nodeEl.className = 'mindmap-node';
        nodeEl.textContent = node.label;
        wrapper.appendChild(nodeEl);

        if (node.children && node.children.length > 0) {
            node.children.forEach(child => {
                const childWrapper = document.createElement('div');
                childWrapper.className = 'mindmap-child';
                
                // Render tree line connector
                const connector = document.createElement('div');
                connector.style.width = '16px';
                connector.style.height = '1px';
                connector.style.background = 'var(--border-color)';
                childWrapper.appendChild(connector);

                const subTree = this.renderMindMapTree(child);
                childWrapper.appendChild(subTree);
                wrapper.appendChild(childWrapper);
            });
        }
        return wrapper;
    }

    parseMarkdownSimple(text) {
        return text
            .replace(/### (.*)/g, '<h3>$1</h3>')
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            .replace(/\*(.*?)\*/g, '<em>$1</em>')
            .replace(/- (.*)/g, '<li>$1</li>');
    }

    // ==========================================
    // AI Copilot Actions
    // ==========================================
    toggleCopilot(open) {
        if (open) {
            this.dom.copilotPanel.classList.remove('collapsed');
            this.dom.btnOpenCopilotFloating.style.display = 'none';
        } else {
            this.dom.copilotPanel.classList.add('collapsed');
            this.dom.btnOpenCopilotFloating.style.display = 'flex';
        }
    }

    renderCopilotMessages() {
        this.dom.copilotMsgList.innerHTML = '';
        this.state.copilotHistory.forEach(msg => {
            const div = document.createElement('div');
            div.className = `msg ${msg.role}`;
            div.innerHTML = this.parseMarkdownSimple(msg.text);
            this.dom.copilotMsgList.appendChild(div);
        });
        this.dom.copilotMsgList.scrollTop = this.dom.copilotMsgList.scrollHeight;
    }

    async handleCopilotSend() {
        const text = this.dom.copilotTextInput.value.trim();
        if (!text) return;

        // Add user msg
        this.state.copilotHistory.push({ role: 'user', text });
        this.renderCopilotMessages();
        this.dom.copilotTextInput.value = '';

        // Add thinking indicator
        const thinkingDiv = document.createElement('div');
        thinkingDiv.className = 'msg ai';
        thinkingDiv.textContent = 'Copilot thinking...';
        this.dom.copilotMsgList.appendChild(thinkingDiv);
        this.dom.copilotMsgList.scrollTop = this.dom.copilotMsgList.scrollHeight;

        try {
            const aiReply = await window.AI.chat(text, this.state.copilotHistory.slice(0, -1), this.state.tasks);
            thinkingDiv.remove();
            
            this.state.copilotHistory.push({ role: 'ai', text: aiReply });
            this.saveState();
            this.renderCopilotMessages();
        } catch (error) {
            thinkingDiv.textContent = "Error gathering response. Check your API settings.";
        }
    }

    // ==========================================
    // Workspace Automations (Flow triggers)
    // ==========================================
    checkFlowTrigger(triggerType, payload) {
        if (triggerType === 'complete_task') {
            const flow = this.state.flows.find(f => f.id === 'flow-2');
            if (flow && flow.active) {
                flow.count++;
                this.saveState();
                this.renderFlows();
                this.showToast('Flow Triggered: Focus Achievement Log', `Completed task celebration trigger run!`);
            }
        }
        
        if (triggerType === 'high_priority_start') {
            const flow = this.state.flows.find(f => f.id === 'flow-1');
            if (flow && flow.active) {
                flow.count++;
                this.saveState();
                this.renderFlows();
                this.toggleCopilot(true);
                this.showToast('Flow Triggered: Slack Sync Alerts', `Alerted Slack channel: "${payload.title}" is in progress.`);
            }
        }

        if (triggerType === 'pomodoro_complete') {
            const flow = this.state.flows.find(f => f.id === 'flow-3');
            if (flow && flow.active) {
                flow.count++;
                this.saveState();
                this.renderFlows();
                this.showToast('Flow Triggered: Pomodoro Transition', `Scheduled 5-minute break session.`);
            }
        }
    }

    // ==========================================
    // Toast Notification System
    // ==========================================
    showToast(title, desc) {
        const toast = document.createElement('div');
        toast.className = 'toast';
        toast.innerHTML = `
            <i class="toast-icon" data-lucide="zap"></i>
            <div class="toast-content">
                <div class="toast-title">${title}</div>
                <div class="toast-desc">${desc}</div>
            </div>
        `;
        this.dom.toastContainer.appendChild(toast);
        lucide.createIcons();

        setTimeout(() => {
            toast.style.animation = 'toast-in 0.3s reverse forwards';
            setTimeout(() => toast.remove(), 300);
        }, 4000);
    }

    updateApiStatusIndicator() {
        if (window.AI.isLiveMode) {
            this.dom.apiStatusDot.style.background = 'var(--accent-emerald)';
            this.dom.apiStatusText.textContent = 'API connected: Active AI Mode';
        } else {
            this.dom.apiStatusDot.style.background = 'var(--accent-amber)';
            this.dom.apiStatusText.textContent = 'Using Demo Simulation Mode';
        }
    }
}

document.addEventListener('DOMContentLoaded', () => {
    window.AppInstance = new App();
});

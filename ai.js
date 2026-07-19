/**
 * ZenFlow AI - Generative AI Service Layer
 * Supports Live Gemini API Mode and High-Fidelity Demo Simulation Mode
 */

class AIService {
    constructor() {
        this.apiKey = localStorage.getItem('zenflow_gemini_api_key') || '';
        this.isLiveMode = !!this.apiKey;
    }

    setApiKey(key) {
        this.apiKey = key;
        this.isLiveMode = !!key;
        if (key) {
            localStorage.setItem('zenflow_gemini_api_key', key);
        } else {
            localStorage.removeItem('zenflow_gemini_api_key');
        }
    }

    hasKey() {
        return this.isLiveMode;
    }

    /**
     * Common method to call the Gemini 2.5 Flash API
     */
    async callGemini(prompt, responseJson = false) {
        if (!this.isLiveMode) {
            throw new Error("API Key not set. Using simulation mode.");
        }

        const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${this.apiKey}`;
        
        const payload = {
            contents: [{
                parts: [{ text: prompt }]
            }]
        };

        if (responseJson) {
            payload.generationConfig = {
                responseMimeType: "application/json"
            };
        }

        try {
            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(payload)
            });

            if (!response.ok) {
                const errData = await response.json();
                throw new Error(errData.error?.message || `HTTP ${response.status}`);
            }

            const data = await response.json();
            const textContent = data.candidates?.[0]?.content?.parts?.[0]?.text;
            
            if (responseJson) {
                return JSON.parse(textContent);
            }
            return textContent;
        } catch (error) {
            console.error("Gemini API Error:", error);
            throw error;
        }
    }

    /**
     * 1. Copilot Assistant Chat
     */
    async chat(userInput, chatHistory = [], contextTasks = []) {
        if (!this.isLiveMode) {
            return this.simulateChat(userInput, contextTasks);
        }

        const taskCtx = contextTasks.map(t => `- [${t.status}] ${t.title} (${t.priority} priority)`).join('\n');
        const systemPrompt = `You are the ZenFlow AI Copilot, a premium workspace assistant.
You help the user manage tasks, write outlines, create content, and build workflows.
Current Tasks in User Workspace:
${taskCtx}

Respond in clean markdown, keeping answers concise and actionable.
Format headings with h3 (###) or bold text instead of large h1s.
Use bullet points, checklists, or small code blocks if appropriate.`;

        // Format history for Gemini API
        const contents = [];
        // Add history
        chatHistory.forEach(msg => {
            contents.push({
                role: msg.role === 'ai' ? 'model' : 'user',
                parts: [{ text: msg.text }]
            });
        });
        // Add latest user input
        contents.push({
            role: 'user',
            parts: [{ text: `${systemPrompt}\n\nUser Question: ${userInput}` }]
        });

        const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${this.apiKey}`;
        
        try {
            const response = await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ contents })
            });

            if (!response.ok) throw new Error("Failed to contact Gemini");
            const data = await response.json();
            return data.candidates?.[0]?.content?.parts?.[0]?.text || "I was unable to formulate a response. Please try again.";
        } catch (error) {
            console.warn("Falling back to simulation chat due to API error", error);
            return this.simulateChat(userInput, contextTasks) + "\n\n*(Note: Fallback simulator triggered due to API error)*";
        }
    }

    simulateChat(input, tasks) {
        const query = input.toLowerCase();
        
        if (query.includes('hello') || query.includes('hi ')) {
            return "Hello! I am your **ZenFlow AI Copilot**. I can help you automate workflows, write emails, summarize notes, or break tasks down. Try asking me: *'Draft a status update email'* or *'Decompose the sprint task'*!";
        }
        
        if (query.includes('email') || query.includes('draft') || query.includes('write')) {
            const taskList = tasks.map(t => `- **${t.title}** (${t.status})`).join('\n');
            return `### Draft: Daily Progress Update

Here is a drafted status update based on your active tasks:

**Subject:** Progress Sync - ${new Date().toLocaleDateString()}

Hi Team,

Here is a quick overview of what I've been working on today:
${tasks.length ? taskList : '- Completed general workspace configuration\n- Set up focus parameters'}

**Focus Time:** 4.2 Hours logged in ZenFlow Focus Zone.

Please let me know if you have any feedback or if we need to sync up on blockers.

Best,
Jane`;
        }

        if (query.includes('task') || query.includes('todo') || query.includes('add')) {
            return "To add or modify tasks, you can use the **Task Board** page and click **Add Task**. If you want me to decompose an existing task into subtasks, select a task card on the board and click the Sparkles icon!";
        }

        if (query.includes('focus') || query.includes('timer')) {
            return "You can use the **Focus Zone** view to start a 25-minute Pomodoro focus block. I've also preloaded ambient sound tracks like Rain or Waves, and I'll generate productivity affirmations to help you maintain your flow state.";
        }

        if (query.includes('meeting') || query.includes('summarize')) {
            return "For meeting notes, navigate to the **Meeting Notes** page, paste your transcripts or rough notes, and click **Summarize with AI**. I will extract general summaries, action lists, and auto-build structural mind maps.";
        }

        return `I understand you're asking about: "${input}". 

As your **ZenFlow Copilot**, I can write code, draft status reports, analyze meeting outputs, or suggest automated workflows. 

*Tip: Connect your Google Gemini API key in the **Settings** panel to enable unrestricted live conversation!*`;
    }

    /**
     * 2. Decompose a parent task into subtasks
     */
    async decomposeTask(title, desc) {
        if (this.isLiveMode) {
            const prompt = `Decompose the following task into a logical checklist of 4-6 detailed, actionable subtasks.
Task Title: ${title}
Task Description: ${desc || "No description provided."}

Return your response strictly as a JSON array of objects, where each object has key "text" (string subtask description) and "done" (boolean false). Do not include markdown formatting like \`\`\`json. Just return raw JSON.`;

            try {
                const subtasks = await this.callGemini(prompt, true);
                if (Array.isArray(subtasks)) return subtasks;
            } catch (error) {
                console.warn("Failing back to mock decomposition", error);
            }
        }
        
        // Mock Decomposition fallback
        return this.getMockSubtasks(title);
    }

    getMockSubtasks(title) {
        const lower = title.toLowerCase();
        if (lower.includes('landing') || lower.includes('design') || lower.includes('ui')) {
            return [
                { text: "Research modern landing pages for dashboard layouts", done: true },
                { text: "Create wireframe outlines of top landing page folds", done: false },
                { text: "Establish glowing violet and glassmorphism styling guide", done: false },
                { text: "Review contrast ratio of primary text colors with team", done: false },
                { text: "Export SVG icons and layout visual assets", done: false }
            ];
        }
        if (lower.includes('code') || lower.includes('dev') || lower.includes('implement')) {
            return [
                { text: "Set up project base repository and build configs", done: true },
                { text: "Create modular routing framework", done: false },
                { text: "Implement API integration endpoints and headers", done: false },
                { text: "Write comprehensive unit tests for core utilities", done: false },
                { text: "Deploy staging build to verification server", done: false }
            ];
        }
        if (lower.includes('meeting') || lower.includes('doc') || lower.includes('write')) {
            return [
                { text: "Gather rough bullet notes from draft docs", done: true },
                { text: "Consolidate outline and clarify key milestones", done: false },
                { text: "Draft comprehensive summary sections", done: false },
                { text: "Verify alignment of action items with stakeholders", done: false }
            ];
        }
        
        // Default generic checklist
        return [
            { text: "Clarify scope, goals, and key objectives", done: true },
            { text: "Gather necessary resources, documents, and reference files", done: false },
            { text: "Draft first iteration outline or structure", done: false },
            { text: "Conduct self-review and refine based on criteria", done: false },
            { text: "Submit for final review and approval", done: false }
        ];
    }

    /**
     * 3. Summarize Meeting Notes / Transcripts
     */
    async summarizeMeeting(rawText) {
        if (!rawText.trim()) return null;

        if (this.isLiveMode) {
            const prompt = `Analyze the following meeting notes/transcript. Generate a summary package containing:
1. Executive summary paragraph
2. Detailed chronological summary headings
3. A list of key Action Items (specifically naming owners if mentioned)
4. A hierarchical Mind Map structure of the discussion.

Return the result strictly as a JSON object with keys:
- "summary": (Markdown string containing headings and bullet summaries)
- "actions": (Array of strings, each being an action item)
- "mindmap": (JSON tree representing the mind map, having format { label: "Root", children: [ { label: "Child 1", children: [] } ] })

Return raw JSON output. No markdown syntax block.`;

            try {
                const result = await this.callGemini(prompt, true);
                if (result && result.summary) return result;
            } catch (error) {
                console.warn("Failing back to mock summarizer", error);
            }
        }

        // Mock Summarization fallback
        return this.getMockSummary(rawText);
    }

    getMockSummary(rawText) {
        // High fidelity mock responses
        return {
            summary: `### Executive Summary
The team discussed the upcoming Q3 product release timeline, design refinements, and infrastructure scalability. The release target remains **August 15**, but design sign-off is a critical path blocker.

### Key Discussion Points
- **Design Refresh:** The team agreed to proceed with a dark-themed glassmorphism layout to evoke premium feel.
- **Backend Scaling:** Server loads spike during sync. We need to throttle concurrent operations to avoid database locks.
- **Staging Run:** The pipeline has intermittent failures. Testing needs to be refactored before deployment.`,
            actions: [
                "**Jane** to sign off on glassmorphic design assets by Wednesday.",
                "**Alex** to configure API throttle headers and test stress levels.",
                "**Team** to schedule a sprint retrospective session next Monday."
            ],
            mindmap: {
                label: "Q3 Release Scope",
                children: [
                    {
                        label: "Design",
                        children: [
                            { label: "Glassmorphism UI", children: [] },
                            { label: "Dark/Light Modes", children: [] }
                        ]
                    },
                    {
                        label: "Engineering",
                        children: [
                            { label: "API Throttling", children: [] },
                            { label: "Staging Pipeline", children: [] }
                        ]
                    },
                    {
                        label: "Milestones",
                        children: [
                            { label: "August 15 Target", children: [] }
                        ]
                    }
                ]
            }
        };
    }

    /**
     * 4. Suggest Tasks & Automations (Dashboard Feed)
     */
    async suggestActions(tasks, focusHours) {
        // Generates suggestion items
        return [
            {
                id: 'sug-1',
                type: 'optimization',
                icon: 'zap',
                iconClass: 'icon-purple',
                title: 'Optimize Workspace Priority',
                desc: `You have ${tasks.filter(t => t.status === 'progress').length} tasks in progress. Let AI re-order priorities to avoid context switching.`,
                actionLabel: 'Optimize Now'
            },
            {
                id: 'sug-2',
                type: 'drafting',
                icon: 'file-text',
                iconClass: 'icon-cyan',
                title: 'Draft Progress Sync',
                desc: 'Generate a daily status report email based on your tasks and focus time.',
                actionLabel: 'Draft Email'
            },
            {
                id: 'sug-3',
                type: 'suggest',
                icon: 'sparkles',
                iconClass: 'icon-amber',
                title: 'Decompose Sprint Task',
                desc: 'Your task "Refactor pipeline testing" has no subtasks. AI can split it into steps.',
                actionLabel: 'Decompose'
            }
        ];
    }

    /**
     * 5. Optimize Task Priorities
     */
    async optimizePriorities(tasks) {
        if (tasks.length <= 1) return tasks;

        if (this.isLiveMode) {
            const taskStr = JSON.stringify(tasks.map(t => ({ id: t.id, title: t.title, desc: t.desc, priority: t.priority })));
            const prompt = `Given the following list of tasks:
${taskStr}

Analyze their titles and details. Suggest an optimized execution order (sorted from most important/urgent to least). Adjust their priority status ('high', 'medium', 'low') if necessary to balance the workload.

Return your response strictly as a JSON array of objects matching the input task structure, but with the items reordered and priorities adjusted if appropriate. Ensure every input task ID exists in your output array. Return raw JSON only.`;

            try {
                const optimized = await this.callGemini(prompt, true);
                if (Array.isArray(optimized)) {
                    // Map back to full tasks
                    return optimized.map(o => {
                        const original = tasks.find(t => t.id === o.id);
                        return { ...original, ...o };
                    });
                }
            } catch (error) {
                console.warn("Failing back to mock optimization", error);
            }
        }

        // Mock optimization fallback (sort High, Medium, Low)
        const priorityOrder = { high: 1, medium: 2, low: 3 };
        return [...tasks].sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);
    }
}

window.AI = new AIService();

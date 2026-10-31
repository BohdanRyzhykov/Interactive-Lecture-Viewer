// ========================================
// 1. DOM REFERENCES
// ========================================
const fileInput = document.getElementById("markdown-file");

const welcome = document.getElementById("welcome");
const fullLecture = document.getElementById("full-lecture");
const overview = document.getElementById("overview");
const viewer = document.getElementById("viewer");

const fullLectureTitle = document.getElementById("full-lecture-title");
const fullLectureMeta = document.getElementById("full-lecture-meta");
const fullLectureContent = document.getElementById("full-lecture-content");

const overviewTitle = document.getElementById("overview-title");
const overviewCount = document.getElementById("overview-count");
const sectionsGrid = document.getElementById("sections-grid");

const lectureContent = document.getElementById("lecture-content");
const sectionTitle = document.getElementById("section-title");
const sectionCounter = document.getElementById("section-counter");
const progress = document.getElementById("progress");

const prevButton = document.getElementById("prev-button");
const nextButton = document.getElementById("next-button");
const previousSideButton = document.getElementById("previous-side-button");
const nextSideButton = document.getElementById("next-side-button");

const overviewButton = document.getElementById("overview-button");
const fullOverviewButton = document.getElementById("full-overview-button");
const readFullLectureButton = document.getElementById("read-full-lecture-button");
const changeFileButton = document.getElementById("change-file-button");
const fullChangeFileButton = document.getElementById("full-change-file-button");

let sections = [];
let currentSection = 0;
let lectureName = "My Lecture";
let lectureMarkdown = "";

// ========================================
// 2. LIBRARY CONFIGURATION
// ========================================
if (window.mermaid) {
    mermaid.initialize({
        startOnLoad: false,
        theme: "default",
        securityLevel: "strict"
    });
}

// ========================================
// 3. FILE UPLOAD
// ========================================
fileInput.addEventListener("change", async () => {
    const file = fileInput.files[0];
    if (!file) return;

    lectureMarkdown = await file.text();
    lectureName = file.name.replace(/\.(md|markdown)$/i, "");
    sections = splitIntoSections(lectureMarkdown);
    currentSection = 0;

    if (sections.length === 0) {
        alert("The Markdown file is empty.");
        return;
    }

    createOverview();
    await renderFullLecture();
    showFullLecture();
});

// ========================================
// 4. SPLIT MARKDOWN INTO READER PAGES
// Each H2 heading starts a new page.
// Text before the first H2 is the introduction page.
// ========================================
function splitIntoSections(markdown) {
    const lines = markdown.split(/\r?\n/);
    const result = [];

    let title = "Introduction";
    let content = [];
    let foundH2 = false;

    for (const line of lines) {
        if (/^##\s+/.test(line)) {
            if (content.join("\n").trim()) {
                result.push({
                    title,
                    content: content.join("\n")
                });
            }

            title = line.replace(/^##\s+/, "").trim();
            content = [line];
            foundH2 = true;
        } else {
            content.push(line);
        }
    }

    if (content.join("\n").trim()) {
        result.push({
            title,
            content: content.join("\n")
        });
    }

    if (!foundH2 && result.length === 0 && markdown.trim()) {
        result.push({
            title: "Full lecture",
            content: markdown
        });
    }

    return result;
}

// ========================================
// 5. RENDER KATEX AND MERMAID
// ========================================
async function renderRichContent(container) {
    if (window.renderMathInElement) {
        renderMathInElement(container, {
            delimiters: [
                { left: "$$", right: "$$", display: true },
                { left: "\\[", right: "\\]", display: true },
                { left: "\\(", right: "\\)", display: false }
            ],
            throwOnError: false
        });
    }

    const mermaidBlocks = container.querySelectorAll("pre code.language-mermaid");

    mermaidBlocks.forEach((code) => {
        const diagram = document.createElement("div");
        diagram.className = "mermaid";
        diagram.textContent = code.textContent;
        code.parentElement.replaceWith(diagram);
    });

    const diagrams = container.querySelectorAll(".mermaid");

    if (diagrams.length > 0 && window.mermaid) {
        try {
            await mermaid.run({ nodes: diagrams });
        } catch (error) {
            console.error("Mermaid rendering error:", error);
        }
    }
}

// ========================================
// 6. FULL LECTURE MODE
// ========================================
async function renderFullLecture() {
    fullLectureTitle.textContent = lectureName;
    fullLectureMeta.textContent = `${sections.length} pages in this lecture`;

    fullLectureContent.innerHTML = marked.parse(lectureMarkdown);
    await renderRichContent(fullLectureContent);
}

function showFullLecture() {
    welcome.hidden = true;
    overview.hidden = true;
    viewer.hidden = true;
    fullLecture.hidden = false;
    window.scrollTo(0, 0);
}

// ========================================
// 7. OVERVIEW MODE
// ========================================
function detectSectionType(content) {
    if (/```mermaid[\s\S]*?```/i.test(content)) return "DIAGRAM";
    if (/\$\$[\s\S]*?\$\$/.test(content) || /\\\[([\s\S]*?)\\\]/.test(content)) return "FORMULA";
    if (/!\[.*?\]\(.*?\)/.test(content)) return "IMAGE";
    if (/```[\s\S]*?```/.test(content)) return "CODE";
    return "TEXT";
}

function createCardVisual(type) {
    const visual = document.createElement("div");
    visual.className = `card-visual visual-${type.toLowerCase()}`;

    const label = document.createElement("span");
    label.className = "visual-label";
    label.textContent = type;

    const preview = document.createElement("div");
    preview.className = "visual-preview";

    if (type === "CODE") {
        preview.innerHTML = "<span>function main() {</span><span class='code-line'> System.out.println(...);</span><span>}</span>";
    } else if (type === "FORMULA") {
        preview.textContent = "∑  x² + y² = z²";
    } else if (type === "DIAGRAM") {
        preview.innerHTML = "<span class='diagram-node'>Start</span><span>→</span><span class='diagram-node'>Process</span>";
    } else if (type === "IMAGE") {
        preview.textContent = "▧ Image content";
    } else {
        preview.innerHTML = "<span class='text-line'></span><span class='text-line'></span><span class='text-line short'></span>";
    }

    visual.append(label, preview);
    return visual;
}

function createOverview() {
    overviewTitle.textContent = lectureName;
    overviewCount.textContent = `${sections.length} pages in this lecture`;
    sectionsGrid.innerHTML = "";

    sections.forEach((section, index) => {
        const card = document.createElement("button");
        card.type = "button";
        card.className = "section-card";

        const number = document.createElement("span");
        number.className = "card-number";
        number.textContent = String(index + 1).padStart(2, "0");

        const type = detectSectionType(section.content);
        const visual = createCardVisual(type);

        const typeLabel = document.createElement("span");
        typeLabel.className = "card-type";
        typeLabel.textContent = type;

        const title = document.createElement("h3");
        title.textContent = section.title;

        const description = document.createElement("p");
        const preview = section.content
            .replace(/^#+\s+/gm, "")
            .replace(/```[\s\S]*?```/g, "[Code example]")
            .replace(/\$\$[\s\S]*?\$\$/g, "[Formula]")
            .replace(/!\[.*?\]\(.*?\)/g, "[Image]")
            .replace(/[`*_>#]/g, "")
            .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
            .replace(/\s+/g, " ")
            .trim();

        description.textContent =
            preview.slice(0, 110) + (preview.length > 110 ? "..." : "");

        card.append(number, visual, typeLabel, title, description);

        card.addEventListener("click", async () => {
            currentSection = index;
            showReader();
            await showSection("next");
        });

        sectionsGrid.appendChild(card);
    });
}

function showOverview() {
    welcome.hidden = true;
    fullLecture.hidden = true;
    viewer.hidden = true;
    overview.hidden = false;
    window.scrollTo(0, 0);
}

// ========================================
// 8. PAGE READER
// ========================================
async function showSection(direction = "next") {
    const section = sections[currentSection];

    lectureContent.classList.remove("page-turning");

    // Short visual transition when turning pages.
    if (direction === "next") {
        lectureContent.classList.add("page-turning");
    } else if (direction === "previous") {
        lectureContent.classList.add("page-turning");
    }

    sectionTitle.textContent = section.title;
    sectionCounter.textContent = `${currentSection + 1} / ${sections.length}`;
    progress.style.width = `${((currentSection + 1) / sections.length) * 100}%`;

    prevButton.disabled = currentSection === 0;
    nextButton.disabled = currentSection === sections.length - 1;
    previousSideButton.disabled = currentSection === 0;
    nextSideButton.disabled = currentSection === sections.length - 1;

    lectureContent.innerHTML = marked.parse(section.content);
    await renderRichContent(lectureContent);

    requestAnimationFrame(() => {
        lectureContent.classList.remove("page-turning");
    });
}

function showReader() {
    welcome.hidden = true;
    fullLecture.hidden = true;
    overview.hidden = true;
    viewer.hidden = false;
    window.scrollTo(0, 0);
}

async function goToPreviousPage() {
    if (currentSection <= 0) return;

    currentSection--;
    await showSection("previous");
    window.scrollTo(0, 0);
}

async function goToNextPage() {
    if (currentSection >= sections.length - 1) return;

    currentSection++;
    await showSection("next");
    window.scrollTo(0, 0);
}

// ========================================
// 9. BUTTON EVENTS
// ========================================
prevButton.addEventListener("click", goToPreviousPage);
previousSideButton.addEventListener("click", goToPreviousPage);
nextButton.addEventListener("click", goToNextPage);
nextSideButton.addEventListener("click", goToNextPage);

overviewButton.addEventListener("click", showOverview);
fullOverviewButton.addEventListener("click", showOverview);
readFullLectureButton.addEventListener("click", showFullLecture);

function openFilePicker() {
    fileInput.value = "";
    fileInput.click();
}

changeFileButton.addEventListener("click", openFilePicker);
fullChangeFileButton.addEventListener("click", openFilePicker);

// ========================================
// 10. KEYBOARD PAGE TURNING
// Left / Right arrows turn pages in Page Reader.
// Ignore keyboard shortcuts while typing in an input.
document.addEventListener("keydown", (event) => {
    if (viewer.hidden) return;

    const tagName = event.target.tagName;
    if (tagName === "INPUT" || tagName === "TEXTAREA" || event.target.isContentEditable) {
        return;
    }

    if (event.key === "ArrowRight") {
        event.preventDefault();
        goToNextPage();
    }

    if (event.key === "ArrowLeft") {
        event.preventDefault();
        goToPreviousPage();
    }
});

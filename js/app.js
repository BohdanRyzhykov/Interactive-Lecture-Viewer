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

const pageStage = document.getElementById("page-stage");
const zoomInButton = document.getElementById("zoom-in-button");
const zoomOutButton = document.getElementById("zoom-out-button");
const resetZoomButton = document.getElementById("reset-zoom-button");
const zoomLevelLabel = document.getElementById("zoom-level");

const overviewButton = document.getElementById("overview-button");
const fullOverviewButton = document.getElementById("full-overview-button");
const readFullLectureButton = document.getElementById("read-full-lecture-button");
const changeFileButton = document.getElementById("change-file-button");
const fullChangeFileButton = document.getElementById("full-change-file-button");

let sections = [];
let readerPages = [];
let currentPage = 0;
let lectureName = "My Lecture";
let lectureMarkdown = "";

let zoomScale = 1;
let panX = 0;
let panY = 0;
let isDraggingPage = false;
let dragStartX = 0;
let dragStartY = 0;
let dragOriginX = 0;
let dragOriginY = 0;

const MIN_ZOOM = 1;
const MAX_ZOOM = 2.5;
const ZOOM_STEP = 0.1;

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
    currentPage = 0;

    if (sections.length === 0) {
        alert("The Markdown file is empty.");
        return;
    }

    createOverview();
    await renderFullLecture();

    // Build actual reader pages from the content of each section.
    readerPages = await paginateLecture(sections);

    showFullLecture();
});

// ========================================
// 4. SPLIT MARKDOWN INTO OVERVIEW SECTIONS
// Every H2 heading starts a new overview section.
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
                result.push({ title, content: content.join("\n") });
            }

            title = line.replace(/^##\s+/, "").trim();
            content = [line];
            foundH2 = true;
        } else {
            content.push(line);
        }
    }

    if (content.join("\n").trim()) {
        result.push({ title, content: content.join("\n") });
    }

    if (!foundH2 && result.length === 0 && markdown.trim()) {
        result.push({ title: "Full lecture", content: markdown });
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
    fullLectureMeta.textContent = `${sections.length} sections`;

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
// 7. AUTOMATIC PAGINATION
// Each overview section may become several reader pages.
// Blocks such as headings, paragraphs, code, lists and
// tables are kept together whenever they fit on a page.
// ========================================
function getReaderPageDimensions() {
    if (window.innerWidth <= 600) {
        return { height: 600, width: Math.max(280, window.innerWidth - 28) };
    }

    if (window.innerWidth <= 850) {
        return { height: 700, width: Math.max(320, window.innerWidth - 48) };
    }

    return { height: 900, width: Math.min(950, window.innerWidth - 48) };
}

async function paginateLecture(sourceSections) {
    const pages = [];
    const dimensions = getReaderPageDimensions();

    // Temporary invisible page with the same dimensions and styles as Reader.
    const measurePage = document.createElement("article");
    measurePage.className = "lecture-content reader-page pagination-measure";
    measurePage.style.width = `${dimensions.width}px`;
    measurePage.style.height = `${dimensions.height}px`;
    measurePage.style.minHeight = "0";
    measurePage.style.overflow = "hidden";
    document.body.appendChild(measurePage);

    for (let sectionIndex = 0; sectionIndex < sourceSections.length; sectionIndex++) {
        const section = sourceSections[sectionIndex];

        // Parse the whole section first so KaTeX and Mermaid are measured correctly.
        const renderedSection = document.createElement("div");
        renderedSection.innerHTML = marked.parse(section.content);
        await renderRichContent(renderedSection);

        const blocks = Array.from(renderedSection.children);
        let currentBlocks = [];

        function saveCurrentPage() {
            if (currentBlocks.length === 0) return;

            pages.push({
                sectionIndex,
                sectionTitle: section.title,
                title: pages.filter(page => page.sectionIndex === sectionIndex).length === 0
                    ? section.title
                    : `${section.title} (continued)`,
                html: currentBlocks.map(block => block.outerHTML).join("")
            });

            currentBlocks = [];
            measurePage.innerHTML = "";
        }

        for (const block of blocks) {
            const clone = block.cloneNode(true);
            measurePage.appendChild(clone);

            // If this block makes the page overflow, move it to a new page.
            // A single very tall block is kept intact rather than split in the middle.
            if (measurePage.scrollHeight > measurePage.clientHeight && currentBlocks.length > 0) {
                measurePage.removeChild(clone);
                saveCurrentPage();
                measurePage.appendChild(clone);
            }

            currentBlocks.push(block);
        }

        saveCurrentPage();
        measurePage.innerHTML = "";
    }

    measurePage.remove();
    return pages;
}

// ========================================
// 8. OVERVIEW MODE
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
    overviewCount.textContent = `${sections.length} sections in this lecture`;
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
            const firstPageIndex = readerPages.findIndex(page => page.sectionIndex === index);
            currentPage = Math.max(0, firstPageIndex);
            showReader();
            await showPage("next");
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
// 9. PAGE READER
// ========================================
async function showPage(direction = "next") {
    if (readerPages.length === 0) return;

    resetZoom();

    const page = readerPages[currentPage];

    lectureContent.classList.remove("page-turning");
    if (direction === "next" || direction === "previous") {
        lectureContent.classList.add("page-turning");
    }

    sectionTitle.textContent = page.title;
    sectionCounter.textContent = `${currentPage + 1} / ${readerPages.length}`;
    progress.style.width = `${((currentPage + 1) / readerPages.length) * 100}%`;

    prevButton.disabled = currentPage === 0;
    nextButton.disabled = currentPage === readerPages.length - 1;
    previousSideButton.disabled = currentPage === 0;
    nextSideButton.disabled = currentPage === readerPages.length - 1;

    lectureContent.innerHTML = page.html;
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
    if (currentPage <= 0) return;

    currentPage--;
    await showPage("previous");
    window.scrollTo(0, 0);
}

async function goToNextPage() {
    if (currentPage >= readerPages.length - 1) return;

    currentPage++;
    await showPage("next");
    window.scrollTo(0, 0);
}

// ========================================
// 10. ZOOM / PAN
// ========================================
function updateZoom() {
    if (!lectureContent || !zoomLevelLabel || !pageStage) return;

    lectureContent.style.transform =
        `translate(${panX}px, ${panY}px) scale(${zoomScale})`;
    zoomLevelLabel.textContent = `${Math.round(zoomScale * 100)}%`;

    pageStage.classList.toggle("is-zoomed", zoomScale > 1);
    pageStage.classList.toggle("is-dragging", isDraggingPage);
}

function setZoom(nextScale) {
    zoomScale = Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, nextScale));

    if (zoomScale === 1) {
        panX = 0;
        panY = 0;
    }

    updateZoom();
}

function resetZoom() {
    zoomScale = 1;
    panX = 0;
    panY = 0;
    isDraggingPage = false;
    updateZoom();
}

if (zoomInButton) {
    zoomInButton.addEventListener("click", () => setZoom(zoomScale + ZOOM_STEP));
}

if (zoomOutButton) {
    zoomOutButton.addEventListener("click", () => setZoom(zoomScale - ZOOM_STEP));
}

if (resetZoomButton) {
    resetZoomButton.addEventListener("click", resetZoom);
}

if (pageStage) {
    pageStage.addEventListener("wheel", (event) => {
        if (viewer.hidden) return;

        event.preventDefault();
        const direction = event.deltaY < 0 ? 1 : -1;
        setZoom(zoomScale + direction * ZOOM_STEP);
    }, { passive: false });

    pageStage.addEventListener("pointerdown", (event) => {
        if (zoomScale <= 1 || event.button !== 0) return;
        if (event.target.closest("button")) return;

        event.preventDefault();
        isDraggingPage = true;
        dragStartX = event.clientX;
        dragStartY = event.clientY;
        dragOriginX = panX;
        dragOriginY = panY;
        pageStage.setPointerCapture(event.pointerId);
        updateZoom();
    });

    pageStage.addEventListener("pointermove", (event) => {
        if (!isDraggingPage) return;

        panX = dragOriginX + (event.clientX - dragStartX);
        panY = dragOriginY + (event.clientY - dragStartY);
        updateZoom();
    });

    function stopDraggingPage() {
        if (!isDraggingPage) return;
        isDraggingPage = false;
        updateZoom();
    }

    pageStage.addEventListener("pointerup", stopDraggingPage);
    pageStage.addEventListener("pointercancel", stopDraggingPage);
    pageStage.addEventListener("lostpointercapture", stopDraggingPage);
}

// ========================================
// 11. BUTTON EVENTS
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
// 12. KEYBOARD PAGE TURNING
// ========================================
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

    if (event.key === "Escape" && zoomScale > 1) {
        resetZoom();
    }
});

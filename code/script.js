  // Maximum allowed PDF size: 10 MB
  const MAX_FILE_SIZE = 10 * 1024 * 1024;

  const questionsData = [
    { id: 1, title: "How to prepare for DSA interviews?", category: "DSA", author: "student_21",
      details: "I am looking for a beginner-friendly preparation roadmap for DSA interviews.",
      answers: ["student_08: Start with arrays, strings and hashing.", "student_14: Practise consistently and revise patterns."],
      displayAnswerCount: 8, likes: 14, liked: false },
    { id: 2, title: "Best resources for DBMS?", category: "DBMS", author: "Asked anonymously",
      details: "Please suggest good PDFs and practice sets for SQL queries and normalization.",
      answers: ["coder_19: Check DBMS SQL Practice.pdf in Notes & Resources."],
      displayAnswerCount: 4, likes: 7, liked: false },
    { id: 3, title: "Help with mini project ideas", category: "Projects", author: "codelearner",
      details: "Need clean web development mini project ideas for 5th semester.",
      answers: ["techie_04: Build a student resource portal or attendance tracker."],
      displayAnswerCount: 3, likes: 5, liked: false }
  ];

  const notesData = [
    { id: 1, title: "Data Structures - Unit 1.pdf", subject: "Data Structures", branch: "CSE", semester: "3",
      uploader: "student_09", description: "Arrays, linked lists, stacks and queues.", pdf: PDF_DATA[1], pages: PAGE_IMG[1], file: null },
    { id: 2, title: "DBMS SQL Practice.pdf", subject: "DBMS", branch: "CSE", semester: "5",
      uploader: "student_12", description: "SQL joins, subqueries and normalization.", pdf: PDF_DATA[2], pages: PAGE_IMG[2], file: null },
    { id: 3, title: "Operating Systems Notes.pdf", subject: "Operating Systems", branch: "CSE", semester: "4",
      uploader: "Uploaded anonymously", description: "CPU scheduling, deadlocks and paging.", pdf: PDF_DATA[3], pages: PAGE_IMG[3], file: null }
  ];

  let currentQuestionId = null;

  function esc(s) {
    return String(s).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  }

  /** Switch between 'explore', 'notes' and 'upload'. */
  function openTab(tab) {
    document.getElementById("tab-explore").hidden = tab !== "explore";
    document.getElementById("tab-notes").hidden = tab !== "notes";
    document.getElementById("tab-upload").hidden = tab !== "upload";
    document.getElementById("navExplore").classList.toggle("active", tab === "explore");
    document.getElementById("navResources").classList.toggle("active", tab !== "explore");
    document.getElementById("sideNotes").classList.toggle("active", tab !== "explore");
    if (tab === "explore") renderQuestions();
    if (tab === "notes") renderNotes();
  }

  function renderQuestions() {
    const q = document.getElementById("qSearch").value.trim().toLowerCase();
    const cat = document.getElementById("qCat").value;
    const list = questionsData.filter(x =>
      (cat === "ALL" || x.category === cat) &&
      (!q || x.title.toLowerCase().includes(q) || x.details.toLowerCase().includes(q)));
    const box = document.getElementById("questionsContainer");
    if (!list.length) { box.innerHTML = '<div class="empty">No questions match your search.</div>'; return; }
    box.innerHTML = list.map(x => `
      <div class="item-card">
        <div class="item-body">
          <div class="item-title">${esc(x.title)}</div>
          <div class="item-meta">${esc(x.category)} · ${esc(x.author)}</div>
          <div class="item-sub">${x.displayAnswerCount} answers · ${x.likes} likes</div>
        </div>
        <button class="pill-btn" type="button" onclick="openQuestion(${x.id})">VIEW</button>
      </div>`).join("");
  }

  function renderNotes() {
    const q = document.getElementById("nSearch").value.trim().toLowerCase();
    const sub = document.getElementById("nSubject").value;
    const br = document.getElementById("nBranch").value;
    const sem = document.getElementById("nSem").value;
    const list = notesData.filter(n =>
      (!q || n.title.toLowerCase().includes(q)) &&
      (sub === "ALL" || n.subject === sub) &&
      (br === "ALL" || n.branch === br) &&
      (sem === "ALL" || n.semester === sem));
    const box = document.getElementById("notesContainer");
    if (!list.length) { box.innerHTML = '<div class="empty">No notes match these filters.</div>'; return; }
    box.innerHTML = list.map(n => `
      <div class="item-card">
        <div class="item-body">
          <div class="item-title">${esc(n.title)}</div>
          <div class="item-meta">${esc(n.subject)} · ${esc(n.branch)} · Semester ${esc(n.semester)}</div>
          <div class="item-sub">${esc(n.uploader)}${n.description ? " · " + esc(n.description) : ""}</div>
        </div>
        <div class="btn-group">
          <button class="pill-btn" type="button" onclick="viewNote(${n.id})">VIEW</button>
          <button class="pill-btn solid" type="button" onclick="downloadNote(${n.id})">DOWNLOAD</button>
        </div>
      </div>`).join("");
  }

  // In the artifact viewer, downloads go through the `downloads` capability; elsewhere a normal link is used.
  let downloadsApi = null;
  try {
    if (window.claude && window.claude.use) {
      window.claude.use("downloads").then(d => { downloadsApi = d; }).catch(() => {});
    }
  } catch (err) { /* standalone page: no capability */ }

  function b64ToBytes(b64) {
    const bin = atob(b64);
    const bytes = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
    return bytes;
  }

  function notesMessage(text, ok) {
    const m = document.getElementById("notesMsg");
    m.textContent = text;
    m.className = "status-msg " + (ok ? "ok" : "err");
  }

  async function downloadNote(id) {
    const n = notesData.find(x => x.id === id);
    if (!n) return;
    const blob = n.file || (n.pdf ? new Blob([b64ToBytes(n.pdf)], { type: "application/pdf" }) : null);
    if (!blob) { notesMessage("No PDF is attached to this entry.", false); return; }
    const filename = n.title.toLowerCase().endsWith(".pdf") ? n.title : n.title + ".pdf";

    if (downloadsApi) {
      try {
        await downloadsApi.save({ filename, data: blob });
        notesMessage("Downloaded " + filename, true);
      } catch (err) {
        if (err && err.code === "declined") notesMessage("Download cancelled.", false);
        else notesMessage("Download is not available here. Open this page in a browser to save the PDF.", false);
      }
      return;
    }
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    notesMessage("Downloaded " + filename, true);
  }

  let viewingId = null;

  function viewNote(id) {
    const n = notesData.find(x => x.id === id);
    if (!n) return;
    if (n.pages) {
      viewingId = id;
      document.getElementById("pdfTitle").textContent = n.title;
      document.getElementById("pdfPages").innerHTML = n.pages.map((src, i) =>
        '<img src="data:image/png;base64,' + src + '" alt="' + esc(n.title) + ' page ' + (i + 1) + '">').join("");
      document.getElementById("pdfDownloadBtn").onclick = () => downloadNote(id);
      document.getElementById("pdfModal").classList.add("show");
      document.querySelector("#pdfModal .modal-card").scrollTop = 0;
      return;
    }
    // Uploaded PDF: let the browser open it in a new tab where that is allowed
    const w = n.file ? window.open(URL.createObjectURL(n.file), "_blank") : null;
    if (!w) notesMessage("This PDF cannot open inside the page. Use DOWNLOAD to save and open it.", false);
  }

  function closePdf() {
    document.getElementById("pdfModal").classList.remove("show");
    viewingId = null;
  }

  function uploadPdf(e) {
    e.preventDefault();
    const msg = document.getElementById("uploadMsg");
    const setMsg = (t, ok) => { msg.textContent = t; msg.className = "status-msg " + (ok ? "ok" : "err"); };
    const file = document.getElementById("pdfInput").files[0];
    const title = document.getElementById("titleInput").value.trim();
    const sb = document.getElementById("subBranchInput").value.trim();
    const sem = document.getElementById("semInput").value.trim();
    const desc = document.getElementById("descInput").value.trim();

    if (!file) return setMsg("Choose a PDF file first.", false);
    if (file.type !== "application/pdf" && !file.name.toLowerCase().endsWith(".pdf")) return setMsg("Only PDF files are allowed.", false);
    if (file.size > MAX_FILE_SIZE) return setMsg("File is larger than 10 MB. Choose a smaller PDF.", false);
    if (!title) return setMsg("Enter a resource title.", false);
    const semNum = Number(sem);
    if (!Number.isInteger(semNum) || semNum < 1 || semNum > 8) return setMsg("Semester must be between 1 and 8.", false);

    const parts = sb.split("/").map(s => s.trim());
    const subject = parts[0] || sb;
    const branch = (parts[1] || "CSE").toUpperCase();

    notesData.unshift({
      id: Date.now(),
      title: title.toLowerCase().endsWith(".pdf") ? title : title + ".pdf",
      subject, branch, semester: String(semNum),
      uploader: "You", description: desc,
      pdf: null, pages: null, file: file
    });
    document.getElementById("uploadForm").reset();
    setMsg("PDF uploaded successfully.", true);
    setTimeout(() => { msg.textContent = ""; openTab("notes"); }, 900);
  }

  function openQuestion(id) {
    const q = questionsData.find(x => x.id === id);
    if (!q) return;
    currentQuestionId = id;
    document.getElementById("mTitle").textContent = q.title;
    document.getElementById("mMeta").textContent = q.category + " · " + q.author;
    document.getElementById("mDetails").textContent = q.details;
    renderModal();
    document.getElementById("qModal").classList.add("show");
  }

  function renderModal() {
    const q = questionsData.find(x => x.id === currentQuestionId);
    if (!q) return;
    document.getElementById("mLikeBtn").textContent = (q.liked ? "LIKED" : "LIKE") + " · " + q.likes;
    document.getElementById("mAnswers").innerHTML = q.answers.length
      ? q.answers.map(a => '<div class="ans-box">' + esc(a) + "</div>").join("")
      : '<div class="empty">No answers yet. Be the first to reply.</div>';
  }

  function likeQuestion() {
    const q = questionsData.find(x => x.id === currentQuestionId);
    if (!q) return;
    q.liked = !q.liked;
    q.likes += q.liked ? 1 : -1;
    renderModal();
    renderQuestions();
  }

  function submitReply(e) {
    e.preventDefault();
    const q = questionsData.find(x => x.id === currentQuestionId);
    const box = document.getElementById("replyBox");
    const text = box.value.trim();
    if (!q || !text) return;
    q.answers.push("You: " + text);
    q.displayAnswerCount += 1;
    box.value = "";
    renderModal();
    renderQuestions();
  }

  function closeModal() {
    document.getElementById("qModal").classList.remove("show");
    currentQuestionId = null;
  }

  document.getElementById("qModal").addEventListener("click", e => { if (e.target.id === "qModal") closeModal(); });
  document.getElementById("pdfModal").addEventListener("click", e => { if (e.target.id === "pdfModal") closePdf(); });
  document.addEventListener("keydown", e => { if (e.key === "Escape") { closeModal(); closePdf(); } });

  openTab("explore");

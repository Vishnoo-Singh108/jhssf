import { useState, useEffect, useRef } from "react";
import axios from "axios";
import logo from "./logo.png"; 
// Storage polyfill for running locally
if (!window.storage) {
  const _store = {};
  window.storage = {
    get: async (key) => _store[key] ? { value: _store[key] } : null,
    set: async (key, value) => { _store[key] = value; return { key, value }; },
    delete: async (key) => { delete _store[key]; return { key, deleted: true }; },
    list: async () => ({ keys: Object.keys(_store) }),
  };
}

const ADMIN_PASSWORD = "9792465181";

const NAV_LINKS = ["Home", "About", "Classes", "Faculty", "Notifications", "Gallery", "Contact"];
const typeColors = { exam: "#e74c3c", event: "#2ecc71", notice: "#ea5b07" };
const typeLabels = { exam: "Exam", event: "Event", notice: "Notice" };

export default function SchoolWebsite() {
  const [activeSection, setActiveSection] = useState("Home");
  const [notifications, setNotifications] = useState([]);
  const [gallery, setGallery] = useState([]);
  const [isAdmin, setIsAdmin] = useState(false);
  const [showAdminLogin, setShowAdminLogin] = useState(false);
  const [adminPwd, setAdminPwd] = useState("");
  const [pwdError, setPwdError] = useState("");
  const [adminTab, setAdminTab] = useState("notifications");
  const [mobileMenu, setMobileMenu] = useState(false);
  const [notifForm, setNotifForm] = useState({ title: "", date: "", type: "notice", content: "" });
  const [galForm, setGalForm] = useState({
    title: "",
    date: "",
    description: "",
    files: [],
    imagePreviews: []
  });
  const [savingNotif, setSavingNotif] = useState(false);
  const [savingGal, setSavingGal] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [successMsg, setSuccessMsg] = useState("");
  const fileRef = useRef();

  useEffect(() => {
    loadData();
    const admin = localStorage.getItem("isAdmin");
    if (admin === "true") {
      setIsAdmin(true);
    }
  }, []);

  async function loadData() {
    try {
      const notifRes = await axios.get(`${process.env.REACT_APP_API_URL}/notifications`);
      setNotifications(Array.isArray(notifRes.data) ? notifRes.data : []);
    } catch (err) {
      console.log(err);
      setNotifications([]);
    }
    try {
      const galleryRes = await axios.get(`${process.env.REACT_APP_API_URL}/gallery`);
      setGallery(Array.isArray(galleryRes.data) ? galleryRes.data : []);
    } catch (err) {
      console.log(err);
      setGallery([]);
    }
  }

  function handleAdminLogin() {
    if (adminPwd === ADMIN_PASSWORD) {
      setIsAdmin(true);
      localStorage.setItem("isAdmin", "true");
      setShowAdminLogin(false);
      setAdminPwd("");
      setPwdError("");
      setActiveSection("Admin");
    } else {
      setPwdError("Incorrect password. Please try again.");
    }
  }

  async function addNotification() {
    if (!notifForm.title || !notifForm.date || !notifForm.content) return;
    setSavingNotif(true);
    try {
      await axios.post(`${process.env.REACT_APP_API_URL}/notifications`, {
        title: notifForm.title,
        date: notifForm.date,
        type: notifForm.type,
        content: notifForm.content
      });
      loadData();
      setNotifForm({ title: "", date: "", type: "notice", content: "" });
      setSuccessMsg("Notification posted successfully!");
      setTimeout(() => { setSuccessMsg(""); }, 3000);
    } catch (err) {
      console.log(err);
    } finally {
      setSavingNotif(false);
    }
  }

  async function deleteNotification(id) {
    setDeletingId(id);
    try {
      await axios.delete(`${process.env.REACT_APP_API_URL}/notifications/${id}`);
      loadData();
    } catch (err) {
      console.log(err);
    } finally {
      setDeletingId(null);
    }
  }

  async function addGalleryItem() {
    if (!galForm.title || !galForm.date || !galForm.description) return;
    setSavingGal(true);

    const colors = ["#1a4a3a", "#2d3a5e", "#4a1a1a", "#3a2d5e", "#1a3a4a", "#4a3a1a"];
    const formData = new FormData();
    formData.append("title", galForm.title);
    formData.append("date", galForm.date);
    formData.append("description", galForm.description);
    formData.append("color", colors[Math.floor(Math.random() * colors.length)]);
    (galForm.files || []).forEach((file) => formData.append("images", file));

    try {
      await axios.post(`${process.env.REACT_APP_API_URL}/gallery`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      loadData();
      setGalForm({ title: "", date: "", description: "", files: [], imagePreviews: [] });
      setSuccessMsg("Gallery item added successfully!");
      setTimeout(() => setSuccessMsg(""), 3000);
    } catch (err) {
      console.log(err);
      alert("Failed to upload. Check backend.");
    }

    setSavingGal(false);
  }

  async function deleteGalleryItem(id) {
    setDeletingId(id);
    try {
      await axios.delete(`${process.env.REACT_APP_API_URL}/gallery/${id}`);
      loadData();
    } catch (err) {
      console.log(err);
    } finally {
      setDeletingId(null);
    }
  }

  function handleImageChange(e) {
    const files = Array.from(e.target.files);
    if (files.length > 10) {
      alert("Maximum 10 photos allowed");
      return;
    }
    const previews = files.map((f) => URL.createObjectURL(f));
    setGalForm((f) => ({ ...f, files: files, imagePreviews: previews }));
  }

  const navTo = (sec) => { setActiveSection(sec); setMobileMenu(false); };

  return (
    <div style={{ fontFamily: "'Georgia','Times New Roman',serif", background: "#f5f1e8", minHeight: "100vh", color: "#1a1a1a" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600;700;900&family=Lato:wght@300;400;700&display=swap');
        *{box-sizing:border-box;margin:0;padding:0;}
        body{font-family:'Lato',sans-serif;}
        .playfair{font-family:'Playfair Display',serif;}
        .nav-link{cursor:pointer;padding:8px 16px;color:#fff;font-family:'Lato',sans-serif;font-size:14px;letter-spacing:1px;text-transform:uppercase;transition:all 0.2s;border-bottom:2px solid transparent;}
        .nav-link:hover,.nav-link.active{border-bottom-color:#d4a017;color:#f5e6b8;}
        .card{background:#fff;border-radius:2px;box-shadow:0 2px 12px rgba(0,0,0,0.08);border-left:4px solid #1a4a3a;transition:transform 0.2s,box-shadow 0.2s;}
        .card:hover{transform:translateY(-2px);box-shadow:0 6px 24px rgba(0,0,0,0.12);}
        .btn{padding:10px 24px;border:none;cursor:pointer;font-family:'Lato',sans-serif;font-weight:700;letter-spacing:1px;text-transform:uppercase;font-size:13px;transition:all 0.2s;border-radius:2px;}
        .btn-primary{background:#1a4a3a;color:#fff;}
        .btn-primary:hover{background:#0f2e24;}
        .btn-danger{background:#c0392b;color:#fff;font-size:11px;padding:5px 12px;}
        .btn-danger:hover{background:#96281b;}
        .btn-danger:disabled{background:#999;cursor:not-allowed;}
        .btn-gold{background:#d4a017;color:#1a1a1a;}
        .btn-gold:hover{background:#b8870e;}
        input,textarea,select{width:100%;padding:10px 14px;border:1px solid #c1c1c1;font-family:'Lato',sans-serif;font-size:14px;background:#fafafa;margin-bottom:12px;border-radius:2px;outline:none;transition:border 0.2s;}
        input:focus,textarea:focus,select:focus{border-color:#1a4a3a;}
        textarea{resize:vertical;min-height:80px;}
        label{font-size:12px;font-weight:700;letter-spacing:1px;text-transform:uppercase;color:#555;display:block;margin-bottom:4px;}
        .notif-badge{display:inline-block;padding:3px 10px;border-radius:20px;font-size:11px;font-weight:700;letter-spacing:0.5px;text-transform:uppercase;color:#fff;}
        .section-title{font-family:'Playfair Display',serif;font-size:36px;font-weight:900;color:#1a4a3a;border-bottom:3px solid #d4a017;padding-bottom:12px;margin-bottom:32px;display:inline-block;}
        .hero-overlay{background:linear-gradient(135deg,rgba(10,40,30,0.88) 0%,rgba(26,74,58,0.75) 60%,rgba(212,160,23,0.3) 100%);}
        .gallery-card{border-radius:4px;overflow:hidden;box-shadow:0 2px 12px rgba(0,0,0,0.1);transition:transform 0.2s,box-shadow 0.2s;}
        .gallery-card:hover{transform:translateY(-4px);box-shadow:0 8px 28px rgba(0,0,0,0.18);}
        .success-toast{position:fixed;bottom:32px;right:32px;background:#1a4a3a;color:#fff;padding:14px 28px;border-radius:4px;font-family:'Lato',sans-serif;font-weight:700;font-size:14px;z-index:1000;box-shadow:0 4px 20px rgba(0,0,0,0.2);animation:slideUp 0.3s ease;}
        .admin-tab{padding:10px 20px;cursor:pointer;border:none;font-family:'Lato',sans-serif;font-weight:700;font-size:13px;letter-spacing:1px;text-transform:uppercase;background:transparent;color:#555;border-bottom:3px solid transparent;transition:all 0.2s;}
        .admin-tab.active{color:#1a4a3a;border-bottom-color:#1a4a3a;}
        .faculty-card{background:#fff;border-radius:2px;box-shadow:0 2px 12px rgba(0,0,0,0.08);overflow:hidden;transition:transform 0.2s,box-shadow 0.2s;}
        .faculty-card:hover{transform:translateY(-4px);box-shadow:0 8px 28px rgba(0,0,0,0.15);}
        .faculty-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:24px;}
        @keyframes slideUp{from{transform:translateY(20px);opacity:0}to{transform:translateY(0);opacity:1}}
        @media(max-width:768px){
          .nav-desktop{display:none!important;}
          .mobile-menu-btn{display:flex!important;}
          .hero-title{font-size:28px!important;}
          .grid-3{grid-template-columns:1fr!important;}
          .grid-2{grid-template-columns:1fr!important;}
          .grid-4{grid-template-columns:1fr 1fr!important;}
          .stats-bar{flex-direction:column!important;gap:16px!important;}
          .faculty-grid{grid-template-columns:1fr 1fr!important;gap:12px!important;}
        }
        @media(min-width:769px){.mobile-menu-btn{display:none!important;}}
        .mobile-nav{display:flex;flex-direction:column;background:#1a4a3a;padding:16px;}
        .mobile-nav .nav-link{padding:12px 16px;border-bottom:1px solid rgba(255,255,255,0.1);}
      `}</style>

      {/* HEADER */}
      <header style={{ background: "linear-gradient(90deg,#0f2e24 0%,#1a4a3a 70%,#1f5a47 100%)", borderBottom: "4px solid #d4a017" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", padding: "16px 24px", display: "flex", alignItems: "center", gap: 20 }}>
          <div style={{ width: 64, height: 64, borderRadius: "50%", background: "#d4a017", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, overflow: "hidden" }}>
            <img src={logo} style={{ width: "100%", height: "100%", objectFit: "contain" }} alt="School Logo" />
          </div>
          <div style={{ flex: 1 }}>
            <div className="playfair" style={{ color: "#f5e6b8", fontSize: 22, fontWeight: 900, lineHeight: 1.2 }}>Janta Higher Secondary School</div>
            <div style={{ color: "#d4a017", fontSize: 13, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase", marginTop: 2 }}>Mahuari Patherdewa • Government School</div>
            <div style={{ color: "#aed6c8", fontSize: 11, letterSpacing: 1 }}>Classes VI – X • Est. Under State Education Board</div>
          </div>
          <nav className="nav-desktop" style={{ display: "flex", alignItems: "center", gap: 2 }}>
            {NAV_LINKS.map(l => <span key={l} className={`nav-link${activeSection === l ? " active" : ""}`} onClick={() => navTo(l)}>{l}</span>)}
            {isAdmin
              ? <><span className={`nav-link${activeSection === "Admin" ? " active" : ""}`} onClick={() => navTo("Admin")}>Admin Panel</span><span className="nav-link" onClick={() => { setIsAdmin(false); localStorage.removeItem("isAdmin"); navTo("Home"); }}>Logout</span></>
              : <span className="nav-link" style={{ background: "#d4a017", color: "#1a1a1a", borderRadius: 2, marginLeft: 8 }} onClick={() => setShowAdminLogin(true)}>Admin</span>
            }
          </nav>
          <button className="mobile-menu-btn" style={{ background: "none", border: "none", cursor: "pointer", display: "none", flexDirection: "column", gap: 5 }} onClick={() => setMobileMenu(m => !m)}>
            {[0, 1, 2].map(i => <div key={i} style={{ width: 26, height: 3, background: "#d4a017", borderRadius: 2 }} />)}
          </button>
        </div>
        {mobileMenu && (
          <div className="mobile-nav">
            {NAV_LINKS.map(l => <span key={l} className={`nav-link${activeSection === l ? " active" : ""}`} onClick={() => navTo(l)}>{l}</span>)}
            {isAdmin
              ? <><span className="nav-link" onClick={() => navTo("Admin")}>Admin Panel</span><span className="nav-link" onClick={() => { setIsAdmin(false); localStorage.removeItem("isAdmin"); navTo("Home"); }}>Logout</span></>
              : <span className="nav-link" onClick={() => { setShowAdminLogin(true); setMobileMenu(false); }}>Admin Login</span>
            }
          </div>
        )}
      </header>

      {/* ADMIN LOGIN MODAL */}
      {showAdminLogin && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", zIndex: 999, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div style={{ background: "#fff", padding: 40, borderRadius: 4, width: 360, boxShadow: "0 20px 60px rgba(0,0,0,0.3)" }}>
            <div className="playfair" style={{ fontSize: 24, fontWeight: 900, color: "#1a4a3a", marginBottom: 8 }}>Principal Admin Login</div>
            <div style={{ fontSize: 13, color: "#777", marginBottom: 24 }}>Enter the admin password to manage content.</div>
            <label>Password</label>
            <input type="password" value={adminPwd} onChange={e => setAdminPwd(e.target.value)} placeholder="Enter password" onKeyDown={e => e.key === "Enter" && handleAdminLogin()} />
            {pwdError && <div style={{ color: "#c0392b", fontSize: 13, marginBottom: 12 }}>{pwdError}</div>}
            <div style={{ display: "flex", gap: 12 }}>
              <button className="btn btn-primary" onClick={handleAdminLogin} style={{ flex: 1 }}>Login</button>
              <button className="btn" style={{ flex: 1, background: "#eee", color: "#333" }} onClick={() => { setShowAdminLogin(false); setAdminPwd(""); setPwdError(""); }}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {successMsg && <div className="success-toast">✓ {successMsg}</div>}

      {activeSection === "Home" && <HomeSection notifications={notifications} gallery={gallery} navTo={navTo} />}
      {activeSection === "About" && <AboutSection />}
      {activeSection === "Classes" && <ClassesSection />}
      {activeSection === "Faculty" && <FacultySection isAdmin={isAdmin} />}
      {activeSection === "Notifications" && <NotificationsSection notifications={notifications} />}
      {activeSection === "Gallery" && <GallerySection gallery={gallery} />}
      {activeSection === "Contact" && <ContactSection />}
      {activeSection === "Admin" && isAdmin && (
        <AdminSection
          adminTab={adminTab} setAdminTab={setAdminTab}
          notifForm={notifForm} setNotifForm={setNotifForm}
          addNotification={addNotification} savingNotif={savingNotif}
          notifications={notifications} deleteNotification={deleteNotification}
          galForm={galForm} setGalForm={setGalForm}
          addGalleryItem={addGalleryItem} savingGal={savingGal}
          gallery={gallery} deleteGalleryItem={deleteGalleryItem}
          fileRef={fileRef} handleImageChange={handleImageChange}
          deletingId={deletingId}
        />
      )}

      <footer style={{ background: "#0f2e24", color: "#aed6c8", padding: "32px 24px", marginTop: 48, textAlign: "center" }}>
        <div className="playfair" style={{ color: "#d4a017", fontSize: 20, fontWeight: 700, marginBottom: 8 }}>Janta Higher Secondary School Mahuari, Patherdewa</div>
        <div style={{ fontSize: 13, marginBottom: 4 }}>Government School • Classes VI to X • Affiliated to State Education Board</div>
        <div style={{ fontSize: 12, color: "#6a9a8a", marginTop: 16, borderTop: "1px solid #1a4a3a", paddingTop: 16, lineHeight: 1.8 }}>
          <div><strong>Principal:</strong> Ashutosh Mani <strong> || Contact:</strong>{" "}<a href="tel:9792465181" style={{ color: "#d4a017", textDecoration: "none" }}>9792465181</a></div>
          <div><strong>Facebook:</strong>{" "}<a href="https://www.facebook.com/ashutosh.mani.39" target="_blank" rel="noreferrer" style={{ color: "#d4a017", textDecoration: "none" }}>🌐</a></div>
          <div><strong>School Location:</strong>{" "}<a href="https://www.google.com/maps/place/Janta+Uchchatar+madhyamik+vidyalaya/@26.565006,83.9311746,18.24z/data=!4m6!3m5!1s0x3993c7a2dd5a6c95:0x9651955cb1da35c2!8m2!3d26.5655312!4d83.931302!16s%2Fg%2F11n0n3m92w?entry=ttu&g_ep=EgoyMDI2MDUwNi4wIKXMDSoASAFQAw%3D%3D" target="_blank" rel="noreferrer" style={{ color: "#d4a017", textDecoration: "none" }}>Open in Google Maps📍</a></div>
        </div>
        <div style={{ fontSize: 12, color: "#6a9a8a", marginTop: 16, borderTop: "1px solid #1a4a3a", paddingTop: 16 }}>© 2026 Janta Higher Secondary School, Mahuari Patherdewa. All Rights Reserved. || Designed & Developed by Vishnoo Singh</div>
      </footer>
    </div>
  );
}

function FacultySection({ isAdmin }) {
  // ✅ FIX 1: removed unused `setFacultyList` setter
  const [facultyList] = useState([
    { name: "Ashutosh Mani", role: "Principal", subject: "School Administration", qualification: " M.Sc Biology, B.Ed", experience: "25+ Years", contact: "9792465181", color: "#d4a017", image: "mani2.jpeg" },
    { name: "Ramdas Parnal", role: "Assistant Teacher", subject: "English", experience: "22+ Years", contact: "8423051231", color: "#3a2d5e", image: "RD.jpeg" },
    { name: "Ajay Bahadur Singh", role: "Assistant Teacher", subject: "Drawing , Sports & Physical Education", experience: "18+ Years", contact: "9839855862", color: "#1a3a4a", image: "ajay.png" },
    { name: "Ranjeet Verma ", role: "Assistant Teacher", subject: "Mathematics", experience: "5+ Years", contact: "9598144797", color: "#1a4a3a", image: "ajit.jpeg" },
    { name: "Jagdeesh Prasad", role: "Assistant Teacher", subject: "Hindi & Sanskrit", experience: "20+ Years+", contact: "9506199438", color: "#2d3a5e", image: "jp.jpeg" },
    { name: "Gajendra Kumar Yadav", role: "Assistant Teacher", subject: "Sanskrit", experience: "20+ Years", contact: "9919702682", color: "#2d3a5e", image: "gaj.jpeg" },
    { name: "Anju Singh", role: "Assistant Teacher", subject: "Home Science", experience: "6+ Years", contact: "9076922307", color: "#4a1a1a", image: "maam.jpeg" },
    { name: "Shailendra Pratap Singh", role: "Clerk/ Office Assistant", contact: "", color: "#06f345", image: "Shialendra.jpeg" },
    { name: "Udaybhan Prasad", role: "Clerk/ Office Assistant", contact: "", color: "#19dc33", image: "peon.jpeg" },
  ]);

  function Avatar({ faculty, size = 90, fontSize = 28, border = "" }) {
    const initials = faculty.name.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase();
    return (
      <div style={{ width: size, height: size, borderRadius: "50%", flexShrink: 0, overflow: "hidden", border: border || `3px solid ${faculty.color}`, background: faculty.image ? "transparent" : faculty.color, display: "flex", alignItems: "center", justifyContent: "center", fontSize, fontWeight: 900, color: "#fff", fontFamily: "'Playfair Display', serif", boxShadow: "0 2px 12px rgba(0,0,0,0.18)" }}>
        {/* ✅ FIX 2: removed duplicate alt prop */}
        {faculty.image ? <img src={faculty.image} alt={faculty.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : initials}
      </div>
    );
  }

  // ✅ FIX 3: removed unused `fileRefs`
  const principal = facultyList[0];
  const teachers = facultyList.slice(1);

  return (
    <div style={{ maxWidth: 1200, margin: "0 auto", padding: "60px 24px" }}>
      <span className="section-title">Our Faculty</span>
      <p style={{ color: "#666", fontSize: 15, lineHeight: 1.8, marginBottom: 40, maxWidth: 700 }}>Our dedicated team of qualified teachers is committed to providing quality education and nurturing every student's potential.</p>
      <div style={{ marginBottom: 40 }}>
        <div style={{ background: "linear-gradient(135deg,#0f2e24,#1a4a3a)", borderRadius: 4, padding: 32, display: "flex", gap: 28, alignItems: "center", flexWrap: "wrap", boxShadow: "0 4px 20px rgba(0,0,0,0.15)" }}>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
            <Avatar faculty={principal} size={100} fontSize={32} border="4px solid rgba(212,160,23,0.8)" />
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ color: "#d4a017", fontSize: 11, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase", marginBottom: 4 }}>School Principal</div>
            <div className="playfair" style={{ color: "#fff", fontSize: 26, fontWeight: 900, marginBottom: 12 }}>{principal.name}</div>
            <div style={{ display: "flex", gap: 24, flexWrap: "wrap" }}>
              {[["🎓 Qualification", principal.qualification], ["📚 Department", principal.subject], ["⏳ Experience", principal.experience], ["📞 Contact", principal.contact || "—"]].map(([label, val]) => (
                <div key={label}>
                  <div style={{ color: "#aed6c8", fontSize: 11, fontWeight: 700, letterSpacing: 1, textTransform: "uppercase" }}>{label}</div>
                  <div style={{ color: "#fff", fontSize: 14, marginTop: 2 }}>{val}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      <div className="faculty-grid">
        {teachers.map((f, i) => (
          <div key={i} className="faculty-card">
            <div style={{ height: 6, background: f.color }} />
            <div style={{ position: "relative", background: f.color + "22", height: 160, display: "flex", alignItems: "center", justifyContent: "center" }}>
              {/* ✅ FIX 2: removed duplicate alt prop */}
              {f.image ? <img src={f.image} alt={f.name} style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "top" }} /> : <Avatar faculty={f} size={90} fontSize={26} />}
            </div>
            <div style={{ padding: 20 }}>
              <div className="playfair" style={{ fontSize: 16, fontWeight: 700, color: "#1a1a1a", lineHeight: 1.3, marginBottom: 2 }}>{f.name}</div>
              <div style={{ fontSize: 12, color: f.color, fontWeight: 700, letterSpacing: 0.5, textTransform: "uppercase", marginBottom: 14 }}>{f.role}</div>
              <div style={{ borderTop: "1px solid #f0f0f0", paddingTop: 12, display: "flex", flexDirection: "column", gap: 7 }}>
                {[...(f.subject ? [["📚", "Subject", f.subject]] : []), ...(f.experience ? [["⏳", "Experience", f.experience]] : []), ...(f.contact ? [["📞", "Contact", f.contact]] : [])].map(([icon, label, val]) => (
                  <div key={label} style={{ display: "flex", gap: 8, alignItems: "flex-start" }}>
                    <span style={{ fontSize: 13, flexShrink: 0, marginTop: 1 }}>{icon}</span>
                    <div>
                      <span style={{ fontSize: 10, color: "#999", fontWeight: 700, textTransform: "uppercase", letterSpacing: 0.5 }}>{label}: </span>
                      <span style={{ fontSize: 13, color: "#444" }}>{val}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
      <div style={{ marginTop: 40, padding: 20, background: "#fff", borderLeft: "4px solid #d4a017", borderRadius: 2, fontSize: 13, color: "#666" }}>
        <strong style={{ color: "#1a4a3a" }}>Note:</strong> For admissions or academic enquiries, please contact the school office or reach out to the Principal directly.
      </div>
    </div>
  );
}

function HomeSection({ notifications, gallery, navTo }) {
  const recent = (Array.isArray(notifications) ? notifications : []).slice(0, 3);
  const recentGal = (Array.isArray(gallery) ? gallery : []).slice(0, 3);
  return (
    <div>
      <div style={{ background: "url('https://images.unsplash.com/photo-1580582932707-520aed937b7b?w=1400&q=80') center/cover", minHeight: 500, position: "relative", display: "flex", alignItems: "center" }}>
        <div className="hero-overlay" style={{ position: "absolute", inset: 0 }} />
        <div style={{ position: "relative", zIndex: 1, maxWidth: 1200, margin: "0 auto", padding: "60px 24px" }}>
          <div style={{ color: "#d4a017", fontSize: 13, fontWeight: 700, letterSpacing: 3, textTransform: "uppercase", marginBottom: 12 }}>Government Higher Secondary School</div>
          <h1 className="hero-title playfair" style={{ color: "#fff", fontSize: 48, fontWeight: 900, lineHeight: 1.1, marginBottom: 16, maxWidth: 640 }}>
            Janta Higher Secondary School<br /><span style={{ color: "#d4a017" }}>Mahuari Patherdewa</span>
          </h1>
          <p style={{ color: "#cde8de", fontSize: 18, maxWidth: 520, lineHeight: 1.7, marginBottom: 32 }}>Nurturing young minds from Class VI to Class X with quality education, values, and character building.</p>
          <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
            <button className="btn btn-gold" onClick={() => navTo("About")}>About School</button>
            <button className="btn" style={{ border: "2px solid #d4a017", background: "transparent", color: "#d4a017" }} onClick={() => navTo("Notifications")}>View Notices</button>
          </div>
        </div>
      </div>
      <div style={{ background: "#1a4a3a", padding: "24px" }}>
        <div className="stats-bar" style={{ maxWidth: 1200, margin: "0 auto", display: "flex", justifyContent: "space-around", gap: 32, textAlign: "center" }}>
          {[["5 Classes", "Class VI to X"], ["Government", "Recognized School"], ["Mahuari Patherdewa", "Uttar Pradesh"], ["Quality", "Education"]].map(([a, b]) => (
            <div key={a}>
              <div className="playfair" style={{ color: "#d4a017", fontSize: 22, fontWeight: 900 }}>{a}</div>
              <div style={{ color: "#aed6c8", fontSize: 12, letterSpacing: 1, textTransform: "uppercase", marginTop: 2 }}>{b}</div>
            </div>
          ))}
        </div>
      </div>
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "60px 24px 0" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 32, flexWrap: "wrap", gap: 12 }}>
          <span className="section-title" style={{ marginBottom: 0 }}>Latest Notices</span>
          <button className="btn btn-primary" onClick={() => navTo("Notifications")}>View All →</button>
        </div>
        <div className="grid-3" style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 20 }}>
          {recent.map(n => (
            <div key={n._id} className="card" style={{ padding: 24, borderLeftColor: typeColors[n.type] || "#1a4a3a" }}>
              <span className="notif-badge" style={{ background: typeColors[n.type] || "#1a4a3a", marginBottom: 12 }}>{typeLabels[n.type]}</span>
              <div className="playfair" style={{ fontSize: 16, fontWeight: 700, marginBottom: 8, lineHeight: 1.4 }}>{n.title}</div>
              <div style={{ fontSize: 12, color: "#888", marginBottom: 10 }}>📅 {n.date}</div>
              <div style={{ fontSize: 13, color: "#555", lineHeight: 1.6 }}>{(n.content || "").slice(0, 100)}{(n.content || "").length > 100 ? "..." : ""}</div>
            </div>
          ))}
          {recent.length === 0 && <div style={{ color: "#888", gridColumn: "1/-1" }}>No notifications yet.</div>}
        </div>
      </div>
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "60px 24px 0" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 32, flexWrap: "wrap", gap: 12 }}>
          <span className="section-title" style={{ marginBottom: 0 }}>Photo Gallery</span>
          <button className="btn btn-primary" onClick={() => navTo("Gallery")}>View All →</button>
        </div>
        <div className="grid-3" style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 20 }}>
          {recentGal.map(g => (
            <div key={g._id} className="gallery-card">
              <div style={{ height: 180, background: g.images?.[0] ? `url(${g.images[0]}) center/cover` : g.color, display: "flex", alignItems: "center", justifyContent: "center" }}>
                {!g.images?.[0] && <span style={{ fontSize: 48 }}>🏫</span>}
              </div>
              <div style={{ padding: 16, background: "#fff" }}>
                <div className="playfair" style={{ fontSize: 15, fontWeight: 700, marginBottom: 4 }}>{g.title}</div>
                <div style={{ fontSize: 11, color: "#888", marginBottom: 8 }}>📅 {g.date}</div>
                <div style={{ fontSize: 13, color: "#555", lineHeight: 1.5 }}>{(g.description || "").slice(0, 80)}{(g.description || "").length > 80 ? "..." : ""}</div>
              </div>
            </div>
          ))}
          {recentGal.length === 0 && <div style={{ color: "#888", gridColumn: "1/-1" }}>No gallery items yet.</div>}
        </div>
      </div>
      <div style={{ background: "#f5f1e8", borderTop: "4px solid #d4a017", borderBottom: "4px solid #d4a017", margin: "60px 0 0", padding: "48px 24px", textAlign: "center" }}>
        <div className="playfair" style={{ fontSize: 28, fontWeight: 900, color: "#1a4a3a", marginBottom: 12 }}>"शिक्षा ही सबसे बड़ी संपत्ति है"</div>
        <div style={{ fontSize: 14, color: "#666", letterSpacing: 2, textTransform: "uppercase" }}>Education is the Greatest Wealth</div>
      </div>
    </div>
  );
}

function AboutSection() {
  return (
    <div style={{ maxWidth: 1200, margin: "0 auto", padding: "60px 24px" }}>
      <span className="section-title">About Our School</span>
      <div className="grid-2" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 40, alignItems: "start" }}>
        <div>
          <div style={{ background: "#1a4a3a", padding: 32, borderRadius: 2, color: "#fff", marginBottom: 24 }}>
            <div className="playfair" style={{ fontSize: 22, fontWeight: 700, color: "#d4a017", marginBottom: 12 }}>Our Mission</div>
            <p style={{ lineHeight: 1.8, color: "#cde8de" }}>To provide quality education to every child in Mahuari and surrounding areas, fostering academic excellence, moral values, and all-round development.</p>
          </div>
          <div style={{ background: "#fff", padding: 32, borderRadius: 2, boxShadow: "0 2px 12px rgba(0,0,0,0.08)", borderLeft: "4px solid #d4a017" }}>
  <div className="playfair" style={{ fontSize: 22, fontWeight: 700, color: "#1a4a3a", marginBottom: 16 }}>Principal's Message</div>
  <div style={{ display: "flex", gap: 20, alignItems: "flex-start" }}>
    <img
  src="mani2.jpeg"
  alt="Principal Ashutosh Mani"
  style={{
    width: 110,
    height: 130,
    borderRadius: "8px",
    objectFit: "cover",
    objectPosition: "center 30%",
    border: "3px solid #d4a017",
    flexShrink: 0,
    boxShadow: "0 2px 10px rgba(0,0,0,0.15)"
  }}
/>
    <div>
      <p style={{ lineHeight: 1.8, color: "#444", fontSize: 14 }}>
        "We are committed to creating a learning environment where every student is encouraged to reach their highest potential. Our dedicated faculty and strong community support make Janta Higher Secondary School a place of excellence."
      </p>
      <div style={{ marginTop: 12, fontWeight: 700, color: "#1a4a3a", fontSize: 13 }}>— Principal, Janta HSS Mahuari, Patherdewa</div>
    </div>
  </div>
</div>
        </div>
        <div>
          {[["🏛️", "Government School", "Recognized and affiliated with Uttar Pradesh state education authorities."], ["📚", "Classes VI to X", "Comprehensive secondary education following the UP Board curriculum."], ["👩‍🏫", "Qualified Faculty", "Experienced and dedicated teachers committed to student success."], ["🌿", "Holistic Development", "Academics, sports, arts, and cultural activities for overall growth."], ["📍", "Location", "Conveniently located in Mahuari ,Patherdewa Deoria 274404 , serving students from the local community."], ["🏆", "Achievements", "Consistent academic results and active participation in district science events."]].map(([icon, title, desc]) => (
            <div key={title} style={{ display: "flex", gap: 16, marginBottom: 20, padding: 20, background: "#fff", borderRadius: 2, boxShadow: "0 1px 8px rgba(0,0,0,0.06)" }}>
              <span style={{ fontSize: 28, flexShrink: 0 }}>{icon}</span>
              <div><div style={{ fontWeight: 700, color: "#1a4a3a", marginBottom: 4 }}>{title}</div><div style={{ fontSize: 13, color: "#666", lineHeight: 1.6 }}>{desc}</div></div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function ClassesSection() {
  const classes = [
    { cls: "Class VI", age: "11-12 yrs", subjects: ["Hindi", "English", "Mathematics", "Science", "Social Science", "Sanskrit"] },
    { cls: "Class VII", age: "12-13 yrs", subjects: ["Hindi", "English", "Mathematics", "Science", "Social Science", "Sanskrit"] },
    { cls: "Class VIII", age: "13-14 yrs", subjects: ["Hindi", "English", "Mathematics", "Science", "Social Science", "Sanskrit"] },
    { cls: "Class IX", age: "14-15 yrs", subjects: ["Hindi", "English/Sanskrit", "Mathematics/Home Science", "Science", "Social Science", "Art/Computer"] },
    { cls: "Class X", age: "15-16 yrs", subjects: ["Hindi", "English/Sanskrit", "Mathematics/Home Science", "Science", "Social Science", "Art/Computer"] },
  ];
  return (
    <div style={{ maxWidth: 1200, margin: "0 auto", padding: "60px 24px" }}>
      <span className="section-title">Our Classes</span>
      <div className="grid-3" style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 24 }}>
        {classes.map((c, i) => (
          <div key={c.cls} className="card" style={{ padding: 28, borderLeftColor: ["#1a4a3a", "#d4a017", "#c0392b", "#2980b9", "#8e44ad"][i] }}>
            <div className="playfair" style={{ fontSize: 24, fontWeight: 900, color: "#1a4a3a", marginBottom: 4 }}>{c.cls}</div>
            <div style={{ fontSize: 12, color: "#888", letterSpacing: 1, textTransform: "uppercase", marginBottom: 16 }}>Age: {c.age}</div>
            <div style={{ fontWeight: 700, fontSize: 12, letterSpacing: 1, textTransform: "uppercase", color: "#555", marginBottom: 10 }}>Subjects:</div>
            <ul style={{ listStyle: "none", padding: 0 }}>
              {c.subjects.map(s => <li key={s} style={{ fontSize: 13, color: "#444", padding: "5px 0", borderBottom: "1px dashed #eee", display: "flex", alignItems: "center", gap: 8 }}><span style={{ color: "#d4a017" }}>▸</span>{s}</li>)}
            </ul>
          </div>
        ))}
        <div style={{ padding: 28, background: "#1a4a3a", borderRadius: 2, color: "#fff" }}>
          <div className="playfair" style={{ fontSize: 22, fontWeight: 900, color: "#d4a017", marginBottom: 12 }}>Co-Curricular Activities</div>
          {["Sports & Physical Education", "Art & Craft", "Annual Cultural Function", "Science Fair", "Quiz Competitions", "National Days Celebration"].map(a => (
            <div key={a} style={{ fontSize: 13, color: "#aed6c8", padding: "6px 0", borderBottom: "1px solid rgba(255,255,255,0.1)", display: "flex", gap: 8 }}><span style={{ color: "#d4a017" }}>✦</span>{a}</div>
          ))}
        </div>
      </div>
    </div>
  );
}

function NotificationsSection({ notifications }) {
  const [filter, setFilter] = useState("all");
  const safeNotifs = Array.isArray(notifications) ? notifications : [];
  const filtered = filter === "all" ? safeNotifs : safeNotifs.filter(n => n.type === filter);
  return (
    <div style={{ maxWidth: 900, margin: "0 auto", padding: "60px 24px" }}>
      <span className="section-title">Notices & Events</span>
      <div style={{ display: "flex", gap: 10, marginBottom: 32, flexWrap: "wrap" }}>
        {["all", "notice", "exam", "event"].map(f => (
          <button key={f} onClick={() => setFilter(f)} style={{ padding: "8px 20px", border: "2px solid #1a4a3a", borderRadius: 2, cursor: "pointer", background: filter === f ? "#1a4a3a" : "transparent", color: filter === f ? "#d4d1d1" : "#1a4a3a", fontWeight: 700, fontSize: 12, letterSpacing: 1, textTransform: "uppercase", transition: "all 0.2s" }}>
            {f === "all" ? "All" : typeLabels[f]}
          </button>
        ))}
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        {filtered.map(n => (
          <div key={n._id} className="card" style={{ padding: 28, borderLeftColor: typeColors[n.type] || "#1a4a3a" }}>
            <div style={{ marginBottom: 12 }}>
              <span className="notif-badge" style={{ background: typeColors[n.type] || "#1a4a3a", marginRight: 10 }}>{typeLabels[n.type] || n.type}</span>
              <span style={{ fontSize: 12, color: "#888" }}>📅 {n.date}</span>
            </div>
            <div className="playfair" style={{ fontSize: 18, fontWeight: 700, marginBottom: 10 }}>{n.title}</div>
            <div style={{ fontSize: 14, color: "#555", lineHeight: 1.7 }}>{n.content}</div>
          </div>
        ))}
        {filtered.length === 0 && <div style={{ textAlign: "center", padding: 60, color: "#888", background: "#e2dddd", borderRadius: 2 }}><div style={{ fontSize: 40, marginBottom: 12 }}>📋</div><div>No notifications found.</div></div>}
      </div>
    </div>
  );
}

function GallerySection({ gallery = [] }) {
  const [selected, setSelected] = useState(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const safeGallery = Array.isArray(gallery) ? gallery : [];

  function openGallery(g) { setSelected(g); setCurrentImageIndex(0); }
  function prevImage(e) { e.stopPropagation(); setCurrentImageIndex(i => (i - 1 + selected.images.length) % selected.images.length); }
  function nextImage(e) { e.stopPropagation(); setCurrentImageIndex(i => (i + 1) % selected.images.length); }

  return (
    <div style={{ maxWidth: 1200, margin: "0 auto", padding: "60px 24px" }}>
      <span className="section-title">Photo Gallery</span>
      <div className="grid-3" style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 24 }}>
        {safeGallery.map(g => (
          <div key={g._id} className="gallery-card" style={{ cursor: "pointer" }} onClick={() => openGallery(g)}>
            <div style={{ height: 200, background: g.images?.[0] ? `url(${g.images[0]}) center/cover` : g.color, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 52, position: "relative" }}>
              {!g.images?.[0] && "🏫"}
              {g.images?.length > 1 && (
                <div style={{ position: "absolute", bottom: 8, right: 8, background: "rgba(0,0,0,0.6)", color: "#fff", fontSize: 11, fontWeight: 700, padding: "3px 8px", borderRadius: 20, letterSpacing: 0.5 }}>📷 {g.images.length} photos</div>
              )}
            </div>
            <div style={{ padding: 20, background: "#fff" }}>
              <div className="playfair" style={{ fontSize: 16, fontWeight: 700, marginBottom: 6 }}>{g.title}</div>
              <div style={{ fontSize: 11, color: "#888", marginBottom: 8 }}>📅 {g.date}</div>
              <div style={{ fontSize: 13, color: "#555", lineHeight: 1.5 }}>{(g.description || "").slice(0, 90)}{(g.description || "").length > 90 ? "..." : ""}</div>
            </div>
          </div>
        ))}
        {safeGallery.length === 0 && (
          <div style={{ textAlign: "center", padding: 60, color: "#888", background: "#fff", borderRadius: 2, gridColumn: "1/-1", boxShadow: "0 2px 12px rgba(0,0,0,0.08)" }}>
            <div style={{ fontSize: 64, marginBottom: 16 }}>📸</div>
            <div style={{ fontSize: 20, fontWeight: 700, color: "#1a4a3a", fontFamily: "'Playfair Display', serif", marginBottom: 8 }}>No Gallery Items Yet</div>
            <div style={{ fontSize: 14, color: "#aaa" }}>Photos from school events will appear here once added by the admin.</div>
          </div>
        )}
      </div>
      {selected && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.85)", zIndex: 999, display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }} onClick={() => setSelected(null)}>
          <div style={{ background: "#fff", borderRadius: 4, maxWidth: 700, width: "100%", overflow: "hidden" }} onClick={e => e.stopPropagation()}>
            <div style={{ height: 340, background: "#111", position: "relative", display: "flex", alignItems: "center", justifyContent: "center" }}>
              {selected.images?.[currentImageIndex] ? <img src={selected.images[currentImageIndex]} alt="" style={{ maxHeight: "100%", maxWidth: "100%", objectFit: "contain" }} /> : <span style={{ fontSize: 72, color: "#fff" }}>🏫</span>}
              {selected.images?.length > 1 && (
                <>
                  <button onClick={prevImage} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", background: "rgba(0,0,0,0.55)", color: "#fff", border: "none", borderRadius: "50%", width: 40, height: 40, fontSize: 20, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>‹</button>
                  <button onClick={nextImage} style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", background: "rgba(0,0,0,0.55)", color: "#fff", border: "none", borderRadius: "50%", width: 40, height: 40, fontSize: 20, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>›</button>
                  <div style={{ position: "absolute", bottom: 10, left: "50%", transform: "translateX(-50%)", background: "rgba(0,0,0,0.55)", color: "#fff", fontSize: 12, padding: "3px 12px", borderRadius: 20 }}>{currentImageIndex + 1} / {selected.images.length}</div>
                </>
              )}
            </div>
            {selected.images?.length > 1 && (
              <div style={{ display: "flex", gap: 6, padding: "10px 16px", background: "#1a1a1a", overflowX: "auto" }}>
                {selected.images.map((img, idx) => (
                  <img key={idx} src={img} alt="" onClick={() => setCurrentImageIndex(idx)} style={{ width: 56, height: 42, objectFit: "cover", borderRadius: 2, cursor: "pointer", flexShrink: 0, border: idx === currentImageIndex ? "2px solid #d4a017" : "2px solid transparent", opacity: idx === currentImageIndex ? 1 : 0.6, transition: "all 0.15s" }} />
                ))}
              </div>
            )}
            <div style={{ padding: 24 }}>
              <div className="playfair" style={{ fontSize: 22, fontWeight: 900, color: "#1a4a3a", marginBottom: 4 }}>{selected.title}</div>
              <div style={{ fontSize: 12, color: "#888", marginBottom: 12 }}>📅 {selected.date}</div>
              <div style={{ fontSize: 14, color: "#444", lineHeight: 1.8 }}>{selected.description}</div>
              <button className="btn btn-primary" style={{ marginTop: 16 }} onClick={() => setSelected(null)}>Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function ContactSection() {
  return (
    <div style={{ maxWidth: 1200, margin: "0 auto", padding: "60px 24px" }}>
      <span className="section-title">Contact Us</span>
      <div className="grid-2" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 40 }}>
        <div>
          {[["📍", "Address", "Janta Higher Secondary School\nMahuari, Uttar Pradesh, India"], ["🏛️", "School Type", "Government Higher Secondary School\nAffiliated to UP Board"], ["📚", "Classes Offered", "Class VI, VII, VIII, IX, X\n(Middle & Secondary Education)"], ["🕐", "School Timings", "Monday to Saturday\n10:00 AM – 3:00 PM"]].map(([icon, title, info]) => (
            <div key={title} style={{ display: "flex", gap: 16, padding: 20, background: "#fff", borderRadius: 2, boxShadow: "0 1px 8px rgba(0,0,0,0.06)", marginBottom: 16 }}>
              <span style={{ fontSize: 28 }}>{icon}</span>
              <div><div style={{ fontWeight: 700, color: "#1a4a3a", marginBottom: 4 }}>{title}</div><div style={{ fontSize: 13, color: "#666", lineHeight: 1.7, whiteSpace: "pre-line" }}>{info}</div></div>
            </div>
          ))}
        </div>
        <div style={{ background: "#1a4a3a", padding: 40, borderRadius: 2, color: "#fff" }}>
          <div className="playfair" style={{ fontSize: 24, fontWeight: 700, color: "#d4a017", marginBottom: 24 }}>Quick Information</div>
          {[["Medium of Instruction", "Hindi (Primary), English (Secondary)"], ["Board Affiliation", "Uttar Pradesh Madhyamik Shiksha Parishad"], ["School Level", "Middle to Secondary (Class 6–10)"], ["Admission", "Open for all eligible students"], ["Facilities", "Classrooms, Lab, Sports Ground"], ["Fee Structure", "Government Norms Apply"]].map(([k, v]) => (
            <div key={k} style={{ display: "flex", justifyContent: "space-between", padding: "12px 0", borderBottom: "1px solid rgba(255,255,255,0.1)", gap: 16 }}>
              <span style={{ fontSize: 13, color: "#aed6c8", fontWeight: 700 }}>{k}</span>
              <span style={{ fontSize: 13, color: "#fff", textAlign: "right" }}>{v}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function AdminSection({ adminTab, setAdminTab, notifForm, setNotifForm, addNotification, savingNotif, notifications, deleteNotification, galForm, setGalForm, addGalleryItem, savingGal, gallery, deleteGalleryItem, fileRef, handleImageChange, deletingId }) {
  return (
    <div style={{ maxWidth: 1100, margin: "0 auto", padding: "60px 24px" }}>
      <span className="section-title">Principal Admin Panel</span>
      <div style={{ background: "#fff", borderRadius: 2, boxShadow: "0 2px 16px rgba(0,0,0,0.08)", overflow: "hidden" }}>
        <div style={{ display: "flex", borderBottom: "2px solid #f0f0f0", padding: "0 24px" }}>
          <button className={`admin-tab${adminTab === "notifications" ? " active" : ""}`} onClick={() => setAdminTab("notifications")}>📋 Notifications</button>
          <button className={`admin-tab${adminTab === "gallery" ? " active" : ""}`} onClick={() => setAdminTab("gallery")}>📸 Gallery</button>
        </div>
        <div style={{ padding: 32 }}>
          {adminTab === "notifications" && (
            <div className="grid-2" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 40 }}>
              <div>
                <div className="playfair" style={{ fontSize: 20, fontWeight: 700, color: "#1a4a3a", marginBottom: 24 }}>Post New Notification</div>
                <label>Notification Title *</label>
                <input value={notifForm.title} onChange={e => setNotifForm(f => ({ ...f, title: e.target.value }))} placeholder="e.g. Annual Examination Notice" />
                <label>Date *</label>
                <input type="date" value={notifForm.date} onChange={e => setNotifForm(f => ({ ...f, date: e.target.value }))} />
                <label>Type</label>
                <select value={notifForm.type} onChange={e => setNotifForm(f => ({ ...f, type: e.target.value }))}>
                  <option value="notice">Notice</option>
                  <option value="exam">Exam</option>
                  <option value="event">Event</option>
                </select>
                <label>Content *</label>
                <textarea value={notifForm.content} onChange={e => setNotifForm(f => ({ ...f, content: e.target.value }))} placeholder="Detailed description..." />
                <button className="btn btn-primary" onClick={addNotification} disabled={savingNotif}>
                  {savingNotif ? "Posting..." : "Post Notification"}
                </button>
              </div>
              <div>
                <div className="playfair" style={{ fontSize: 20, fontWeight: 700, color: "#1a4a3a", marginBottom: 24 }}>Posted Notifications ({notifications.length})</div>
                <div style={{ maxHeight: 450, overflowY: "auto", paddingRight: 8 }}>
                  {notifications.map(n => (
                    <div key={n._id} style={{ background: "#f9f9f9", borderRadius: 2, padding: 16, marginBottom: 12, borderLeft: `4px solid ${typeColors[n.type] || "#1a4a3a"}` }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 8 }}>
                        <div style={{ flex: 1 }}>
                          <span className="notif-badge" style={{ background: typeColors[n.type] || "#1a4a3a", marginBottom: 6 }}>{typeLabels[n.type]}</span>
                          <div style={{ fontWeight: 700, fontSize: 14, marginTop: 6 }}>{n.title}</div>
                          <div style={{ fontSize: 11, color: "#888" }}>{n.date}</div>
                        </div>
                        <button className="btn btn-danger" onClick={() => deleteNotification(n._id)} disabled={deletingId === n._id}>
                          {deletingId === n._id ? "Deleting..." : "Delete"}
                        </button>
                      </div>
                    </div>
                  ))}
                  {notifications.length === 0 && <div style={{ color: "#888", textAlign: "center", padding: 40 }}>No notifications posted yet.</div>}
                </div>
              </div>
            </div>
          )}
          {adminTab === "gallery" && (
            <div className="grid-2" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 40 }}>
              <div>
                <div className="playfair" style={{ fontSize: 20, fontWeight: 700, color: "#1a4a3a", marginBottom: 24 }}>Add Gallery Item</div>
                <label>Event/Photo Title *</label>
                <input value={galForm.title} onChange={e => setGalForm(f => ({ ...f, title: e.target.value }))} placeholder="e.g. Annual Sports Day 2025" />
                <label>Date *</label>
                <input type="date" value={galForm.date} onChange={e => setGalForm(f => ({ ...f, date: e.target.value }))} />
                <label>Description *</label>
                <textarea value={galForm.description} onChange={e => setGalForm(f => ({ ...f, description: e.target.value }))} placeholder="Describe the event or photo..." />
                <label>Upload Photo (Optional)</label>
                <input ref={fileRef} type="file" accept="image/*" multiple onChange={handleImageChange} />
                {galForm.imagePreviews.length > 0 && (
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 10, marginBottom: 12 }}>
                    {galForm.imagePreviews.map((img, index) => (
                      <img key={index} src={img} alt="" style={{ width: "100%", height: 100, objectFit: "cover", borderRadius: 2 }} />
                    ))}
                  </div>
                )}
                <button className="btn btn-primary" onClick={addGalleryItem} disabled={savingGal}>
                  {savingGal ? "Adding..." : "Add to Gallery"}
                </button>
              </div>
              <div>
                <div className="playfair" style={{ fontSize: 20, fontWeight: 700, color: "#1a4a3a", marginBottom: 24 }}>Gallery Items ({gallery.length})</div>
                <div style={{ maxHeight: 450, overflowY: "auto", paddingRight: 8 }}>
                  {gallery.map(g => (
                    <div key={g._id} style={{ background: "#f9f9f9", borderRadius: 2, padding: 14, marginBottom: 12, display: "flex", gap: 14, alignItems: "center" }}>
                      <div style={{ width: 56, height: 56, borderRadius: 2, background: g.images?.[0] ? `url(${g.images[0]}) center/cover` : g.color, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24 }}>{!g.images?.[0] && "🏫"}</div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 700, fontSize: 13 }}>{g.title}</div>
                        <div style={{ fontSize: 11, color: "#888" }}>{g.date}</div>
                        <div style={{ fontSize: 12, color: "#666", marginTop: 2 }}>{(g.description || "").slice(0, 60)}{(g.description || "").length > 60 ? "..." : ""}</div>
                      </div>
                      <button className="btn btn-danger" onClick={() => deleteGalleryItem(g._id)} disabled={deletingId === g._id}>
                        {deletingId === g._id ? "Deleting..." : "Delete"}
                      </button>
                    </div>
                  ))}
                  {gallery.length === 0 && <div style={{ color: "#888", textAlign: "center", padding: 40 }}>No gallery items yet.</div>}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
      <div style={{ marginTop: 20, padding: 16, background: "#fff8e6", borderLeft: "4px solid #d4a017", borderRadius: 2, fontSize: 13, color: "#7a5800" }}>
        <strong>Admin Tip:</strong> All changes are saved automatically and will instantly appear on the website. To logout, click "Logout" in the navigation bar.
      </div>
    </div>
  );
}
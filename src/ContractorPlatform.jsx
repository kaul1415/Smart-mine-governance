import * as React from "react";
const { useState } = React;
import {
  LayoutDashboard, FileText, PlusCircle, ArrowLeft, Upload, X, Search,
  CheckCircle2, XCircle, Clock, FileCheck, Users, IndianRupee, MapPin,
  Calendar, HardHat, ClipboardList, TrendingUp, Image as ImageIcon,
  ChevronRight, Building2, LogOut, Send, Save, Eye, AlertTriangle
} from "lucide-react";

/* ============================================================
   FONTS + GLOBAL STYLE
   ============================================================ */
const GlobalStyle = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Sans:wght@400;500;600;700&family=IBM+Plex+Mono:wght@500;600&display=swap');
    .cmp-root, .cmp-root * { font-family: 'IBM Plex Sans', sans-serif; box-sizing: border-box; }
    .cmp-data { font-family: 'IBM Plex Mono', monospace; }
    .cmp-scroll::-webkit-scrollbar { width: 8px; height: 8px; }
    .cmp-scroll::-webkit-scrollbar-thumb { background: #d6d2c4; border-radius: 4px; }
  `}</style>
);

/* ============================================================
   MOCK DATA
   ============================================================ */
const CURRENT_CONTRACTOR = "ABC Infrastructure Ltd.";

const seedSubmissions = () => ([
  {
    id: 101,
    contractor: CURRENT_CONTRACTOR,
    projectName: "Jharia Access Road Rehabilitation",
    description: "Rehabilitation of the 4.2km haul road connecting Jharia block to the central weighbridge, including drainage and retaining wall works.",
    location: "Jharia, Jharkhand",
    duration: "6 months",
    startDate: "2026-09-15",
    endDate: "2027-03-15",
    workersRequired: 45,
    engineersRequired: 4,
    supervisorsRequired: 6,
    otherPersonnel: 10,
    requirements: "Road grading equipment, drainage material, retaining wall construction crew.",
    skillsResources: "Certified heavy-equipment operators, civil engineers with mining road experience.",
    equipment: "2x graders, 1x excavator, 3x tipper trucks, compactor.",
    otherRequirements: "Night-shift lighting for phase 2.",
    budget: 10800000,
    additionalCost: "Contingency of 8% for monsoon delays.",
    notes: "Site access requires prior clearance from mine safety officer.",
    specialRequirements: "Work must pause during blasting windows (11am-12pm daily).",
    pdf: { name: "Jharia_Road_Tender.pdf", size: "1.4 MB", type: "PDF" },
    status: "Selected",
    submissionDate: "2026-07-02",
    currentProgress: 55,
    updates: [
      {
        id: 1, title: "Foundation & Grading Complete", date: "2026-09-28", progress: 25,
        workCompleted: "Site clearing and base grading completed across full 4.2km stretch.",
        workRemaining: "Drainage channel excavation, retaining wall footing.",
        issues: "Minor delay due to monsoon runoff in week 2.",
        notes: "Team on schedule to recover lost days by phase 2.",
        files: [{ name: "grading_progress_map.pdf", type: "Map", size: "2.1 MB" }],
      },
      {
        id: 2, title: "Drainage & Retaining Wall Underway", date: "2026-11-05", progress: 55,
        workCompleted: "Drainage channels complete; retaining wall 60% poured.",
        workRemaining: "Wall curing, final compaction, surface asphalt layer.",
        issues: "None significant.",
        notes: "Requesting additional 2 supervisors for final phase.",
        files: [
          { name: "site_photo_wall_section2.jpg", type: "Image", size: "3.4 MB" },
          { name: "retaining_wall_spec_update.pdf", type: "Document", size: "980 KB" },
        ],
      },
    ],
    finalUpdate: null,
  },
  {
    id: 102,
    contractor: CURRENT_CONTRACTOR,
    projectName: "Weighbridge Automation Shed",
    description: "Construction of a covered shed and control room for the new automated weighbridge unit.",
    location: "Jharia, Jharkhand",
    duration: "3 months",
    startDate: "2026-10-01",
    endDate: "2026-12-31",
    workersRequired: 18,
    engineersRequired: 2,
    supervisorsRequired: 2,
    otherPersonnel: 3,
    requirements: "Structural steel shed, electrical wiring for control room.",
    skillsResources: "Structural fabrication team, licensed electrician.",
    equipment: "Mobile crane, welding units.",
    otherRequirements: "-",
    budget: 4200000,
    additionalCost: "-",
    notes: "Coordination needed with automation vendor for handover.",
    specialRequirements: "-",
    pdf: null,
    status: "Under Review",
    submissionDate: "2026-08-18",
    currentProgress: 0,
    updates: [],
    finalUpdate: null,
  },
  {
    id: 103,
    contractor: "XYZ Earthworks Pvt. Ltd.",
    projectName: "Overburden Removal - Block C",
    description: "Removal and relocation of overburden material from Block C to designated dump yard.",
    location: "Dhanbad, Jharkhand",
    duration: "8 months",
    startDate: "2026-09-01",
    endDate: "2027-04-30",
    workersRequired: 60,
    engineersRequired: 5,
    supervisorsRequired: 8,
    otherPersonnel: 12,
    requirements: "Heavy earthmoving fleet, dump yard access route.",
    skillsResources: "Mining plant operators, blasting-adjacent safety crew.",
    equipment: "4x dumpers, 2x excavators, dozers.",
    otherRequirements: "24-hour operation shifts.",
    budget: 15600000,
    additionalCost: "Fuel escalation clause requested.",
    notes: "Prior experience with Block A overburden removal (2024).",
    specialRequirements: "Dust suppression system mandatory.",
    pdf: { name: "BlockC_Overburden_Proposal.pdf", size: "2.8 MB", type: "PDF" },
    status: "Submitted",
    submissionDate: "2026-08-25",
    currentProgress: 0,
    updates: [],
    finalUpdate: null,
  },
  {
    id: 104,
    contractor: "Bharat Mining Services Co.",
    projectName: "Conveyor Belt Maintenance Contract",
    description: "Annual maintenance contract for the main coal conveyor system, sections B1-B4.",
    location: "Jharia, Jharkhand",
    duration: "12 months",
    startDate: "2026-08-01",
    endDate: "2027-07-31",
    workersRequired: 22,
    engineersRequired: 3,
    supervisorsRequired: 3,
    otherPersonnel: 4,
    requirements: "Belt splicing equipment, spare rollers stock.",
    skillsResources: "Certified conveyor technicians.",
    equipment: "Belt splicing kit, diagnostic sensors.",
    otherRequirements: "-",
    budget: 6900000,
    additionalCost: "-",
    notes: "-",
    specialRequirements: "-",
    pdf: { name: "Conveyor_AMC_2026.pdf", size: "760 KB", type: "PDF" },
    status: "Rejected",
    submissionDate: "2026-07-10",
    currentProgress: 0,
    updates: [],
    finalUpdate: null,
  },
]);

const emptyForm = {
  projectName: "", description: "", location: "", duration: "",
  startDate: "", endDate: "", workersRequired: "", engineersRequired: "",
  supervisorsRequired: "", otherPersonnel: "", requirements: "",
  skillsResources: "", equipment: "", otherRequirements: "", budget: "",
  additionalCost: "", notes: "", specialRequirements: "", pdf: null,
};

/* ============================================================
   SMALL SHARED COMPONENTS
   ============================================================ */
const STATUS_STYLES = {
  Draft:        { bg: "bg-slate-100",  text: "text-slate-600",  dot: "bg-slate-400" },
  Submitted:    { bg: "bg-sky-50",     text: "text-sky-700",    dot: "bg-sky-500" },
  "Under Review": { bg: "bg-amber-50", text: "text-amber-700",  dot: "bg-amber-500" },
  Selected:     { bg: "bg-emerald-50", text: "text-emerald-700", dot: "bg-emerald-500" },
  Rejected:     { bg: "bg-rose-50",    text: "text-rose-700",   dot: "bg-rose-500" },
};

function StatusBadge({ status }) {
  const s = STATUS_STYLES[status] || STATUS_STYLES.Draft;
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${s.bg} ${s.text}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`} />
      {status}
    </span>
  );
}

function ProgressBar({ value, tone = "amber" }) {
  const tones = { amber: "bg-amber-500", emerald: "bg-emerald-500", sky: "bg-sky-500" };
  return (
    <div className="w-full">
      <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
        <div className={`h-full ${tones[tone]} rounded-full transition-all`} style={{ width: `${value}%` }} />
      </div>
    </div>
  );
}

function FileUploadCard({ file, onRemove, icon: Icon = FileText }) {
  if (!file) return null;
  return (
    <div className="flex items-center justify-between border border-slate-200 rounded-lg px-3 py-2.5 bg-slate-50">
      <div className="flex items-center gap-2.5 min-w-0">
        <div className="w-8 h-8 rounded bg-white border border-slate-200 flex items-center justify-center shrink-0">
          <Icon size={15} className="text-slate-500" />
        </div>
        <div className="min-w-0">
          <p className="text-sm font-medium text-slate-800 truncate">{file.name}</p>
          <p className="text-xs text-slate-500 cmp-data">{file.type} · {file.size}</p>
        </div>
      </div>
      {onRemove && (
        <button onClick={onRemove} className="text-slate-400 hover:text-rose-600 shrink-0 ml-2">
          <X size={16} />
        </button>
      )}
    </div>
  );
}

function StatCard({ label, value, icon: Icon, tone = "slate" }) {
  const tones = {
    slate: "bg-slate-800 text-white", amber: "bg-amber-500 text-white",
    emerald: "bg-emerald-600 text-white", sky: "bg-sky-600 text-white",
  };
  return (
    <div className="bg-white border border-slate-200 rounded-xl p-4 flex items-center gap-3.5">
      <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${tones[tone]}`}>
        <Icon size={18} />
      </div>
      <div>
        <p className="text-2xl font-semibold text-slate-900 cmp-data leading-none">{value}</p>
        <p className="text-xs text-slate-500 mt-1">{label}</p>
      </div>
    </div>
  );
}

function EmptyState({ icon: Icon, title, subtitle, action }) {
  return (
    <div className="flex flex-col items-center justify-center text-center py-16 px-6 border border-dashed border-slate-300 rounded-xl bg-slate-50/50">
      <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mb-3">
        <Icon size={20} className="text-slate-400" />
      </div>
      <p className="text-sm font-medium text-slate-700">{title}</p>
      {subtitle && <p className="text-xs text-slate-500 mt-1 max-w-sm">{subtitle}</p>}
      {action}
    </div>
  );
}

function Field({ label, children, span = 1 }) {
  return (
    <div className={span === 2 ? "sm:col-span-2" : ""}>
      <label className="block text-xs font-medium text-slate-600 mb-1.5">{label}</label>
      {children}
    </div>
  );
}

const inputCls = "w-full border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-500/40 focus:border-amber-500 placeholder:text-slate-400";

function fmtINR(n) {
  if (!n && n !== 0) return "-";
  return "₹" + Number(n).toLocaleString("en-IN");
}

/* ============================================================
   SIDEBAR + TOPBAR
   ============================================================ */
function Sidebar({ role, items, active, onNavigate, onExit, contractorName }) {
  return (
    <aside className="w-60 bg-slate-900 text-slate-300 flex flex-col shrink-0 h-full">
      <div className="px-5 py-5 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-md bg-amber-500 flex items-center justify-center">
            <HardHat size={16} className="text-slate-900" />
          </div>
          <div>
            <p className="text-white text-sm font-semibold leading-tight">Coal Mining CMS</p>
            <p className="text-[11px] text-slate-500 leading-tight">Contractor Management</p>
          </div>
        </div>
      </div>
      <nav className="flex-1 px-3 py-4 space-y-1">
        {items.map((it) => (
          <button
            key={it.key}
            onClick={() => onNavigate(it.key)}
            className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm transition-colors ${
              active === it.key ? "bg-slate-800 text-white" : "text-slate-400 hover:bg-slate-800/60 hover:text-slate-200"
            }`}
          >
            <it.icon size={16} />
            {it.label}
          </button>
        ))}
      </nav>
      <div className="px-5 py-4 border-t border-slate-800">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-7 h-7 rounded-full bg-slate-700 flex items-center justify-center text-xs font-medium text-white">
            {role === "contractor" ? contractorName.charAt(0) : "PM"}
          </div>
          <div className="min-w-0">
            <p className="text-xs text-slate-200 font-medium truncate">
              {role === "contractor" ? contractorName : "Project Manager"}
            </p>
            <p className="text-[11px] text-slate-500">{role === "contractor" ? "Contractor" : "Management"}</p>
          </div>
        </div>
        <button onClick={onExit} className="w-full flex items-center gap-2 text-xs text-slate-400 hover:text-white px-1">
          <LogOut size={13} /> Switch dashboard
        </button>
      </div>
    </aside>
  );
}

function TopBar({ title, subtitle }) {
  return (
    <div className="border-b border-slate-200 bg-white px-8 py-5 flex items-center justify-between shrink-0">
      <div>
        <h1 className="text-lg font-semibold text-slate-900">{title}</h1>
        {subtitle && <p className="text-sm text-slate-500 mt-0.5">{subtitle}</p>}
      </div>
    </div>
  );
}

/* ============================================================
   LANDING
   ============================================================ */
function Landing({ onSelect }) {
  return (
    <div className="cmp-root min-h-full w-full bg-[#F7F5F1] flex items-center justify-center p-6">
      <GlobalStyle />
      <div className="max-w-3xl w-full">
        <div className="text-center mb-10">
          <div className="w-12 h-12 rounded-xl bg-amber-500 flex items-center justify-center mx-auto mb-4">
            <HardHat size={22} className="text-slate-900" />
          </div>
          <h1 className="text-2xl font-semibold text-slate-900">Contractor Management System</h1>
          <p className="text-sm text-slate-500 mt-2">Select a dashboard to continue</p>
        </div>
        <div className="grid sm:grid-cols-2 gap-5">
          <button
            onClick={() => onSelect("contractor")}
            className="group text-left bg-white border border-slate-200 rounded-2xl p-6 hover:border-amber-400 hover:shadow-lg transition-all"
          >
            <div className="w-11 h-11 rounded-lg bg-amber-50 flex items-center justify-center mb-4 group-hover:bg-amber-500 transition-colors">
              <Building2 size={20} className="text-amber-600 group-hover:text-white transition-colors" />
            </div>
            <p className="text-base font-semibold text-slate-900">Contractor</p>
            <p className="text-sm text-slate-500 mt-1.5">Submit tenure requirements, track submission status, and post project progress updates.</p>
            <p className="text-sm font-medium text-amber-600 mt-4 flex items-center gap-1">
              Enter dashboard <ChevronRight size={15} />
            </p>
          </button>
          <button
            onClick={() => onSelect("admin")}
            className="group text-left bg-white border border-slate-200 rounded-2xl p-6 hover:border-slate-400 hover:shadow-lg transition-all"
          >
            <div className="w-11 h-11 rounded-lg bg-slate-100 flex items-center justify-center mb-4 group-hover:bg-slate-900 transition-colors">
              <ClipboardList size={20} className="text-slate-700 group-hover:text-white transition-colors" />
            </div>
            <p className="text-base font-semibold text-slate-900">Project Management</p>
            <p className="text-sm text-slate-500 mt-1.5">Review contractor submissions, select contractors, and monitor active project updates.</p>
            <p className="text-sm font-medium text-slate-700 mt-4 flex items-center gap-1">
              Enter dashboard <ChevronRight size={15} />
            </p>
          </button>
        </div>
      </div>
    </div>
  );
}

/* ============================================================
   CONTRACTOR APP
   ============================================================ */
function ContractorApp({ submissions, setSubmissions, onExit }) {
  const [view, setView] = useState("dashboard");
  const [selectedId, setSelectedId] = useState(null);
  const [form, setForm] = useState(emptyForm);

  const mine = submissions.filter((s) => s.contractor === CURRENT_CONTRACTOR);
  const selected = submissions.find((s) => s.id === selectedId);

  const navItems = [
    { key: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    { key: "submissions", label: "My Submissions", icon: FileText },
    { key: "new", label: "Submit New Tenure", icon: PlusCircle },
  ];

  function goDetail(id) { setSelectedId(id); setView("detail"); }
  function goProject(id) { setSelectedId(id); setView("project"); }

  function handleSubmitForm(status) {
    if (!form.projectName.trim()) return;
    const newEntry = {
      id: Date.now(),
      contractor: CURRENT_CONTRACTOR,
      ...form,
      budget: form.budget ? Number(form.budget) : 0,
      status,
      submissionDate: new Date().toISOString().slice(0, 10),
      currentProgress: 0,
      updates: [],
      finalUpdate: null,
    };
    setSubmissions((prev) => [newEntry, ...prev]);
    setForm(emptyForm);
    setView("submissions");
  }

  function addUpdate(update) {
    setSubmissions((prev) => prev.map((s) => {
      if (s.id !== selectedId) return s;
      return { ...s, currentProgress: update.progress, updates: [...s.updates, update] };
    }));
  }

  function submitFinal(finalUpdate) {
    setSubmissions((prev) => prev.map((s) => s.id === selectedId ? { ...s, finalUpdate, currentProgress: finalUpdate.finalPercent } : s));
  }

  return (
    <div className="cmp-root flex h-full w-full bg-[#F7F5F1]">
      <GlobalStyle />
      <Sidebar role="contractor" items={navItems} active={view === "detail" || view === "project" ? "submissions" : view}
        onNavigate={(k) => { setView(k); setSelectedId(null); }} onExit={onExit} contractorName={CURRENT_CONTRACTOR} />
      <div className="flex-1 flex flex-col min-w-0">
        {view === "dashboard" && (
          <>
            <TopBar title="Dashboard" subtitle={`Welcome back, ${CURRENT_CONTRACTOR}`} />
            <div className="flex-1 overflow-auto cmp-scroll p-8">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
                <StatCard label="Total submissions" value={mine.length} icon={FileText} tone="slate" />
                <StatCard label="Under review" value={mine.filter(s => s.status === "Under Review" || s.status === "Submitted").length} icon={Clock} tone="amber" />
                <StatCard label="Selected" value={mine.filter(s => s.status === "Selected").length} icon={CheckCircle2} tone="emerald" />
                <StatCard label="Active projects" value={mine.filter(s => s.status === "Selected" && !s.finalUpdate).length} icon={TrendingUp} tone="sky" />
              </div>
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-sm font-semibold text-slate-800">Recent submissions</h2>
                <button onClick={() => setView("submissions")} className="text-xs font-medium text-amber-600 hover:text-amber-700">View all</button>
              </div>
              <SubmissionsTable rows={mine.slice(0, 4)} onView={goDetail} onOpenProject={goProject} />
            </div>
          </>
        )}

        {view === "submissions" && (
          <>
            <TopBar title="My Submissions" subtitle="All tenure and project submissions you've made" />
            <div className="flex-1 overflow-auto cmp-scroll p-8">
              {mine.length === 0
                ? <EmptyState icon={FileText} title="No submissions yet" subtitle="Create your first tenure/project submission to get started."
                    action={<button onClick={() => setView("new")} className="mt-4 text-sm font-medium bg-amber-500 text-white px-4 py-2 rounded-lg hover:bg-amber-600">Submit New Tenure</button>} />
                : <SubmissionsTable rows={mine} onView={goDetail} onOpenProject={goProject} />}
            </div>
          </>
        )}

        {view === "new" && (
          <>
            <TopBar title="Submit New Tenure / Project" subtitle="Enter your project details, requirements, workforce and budget" />
            <div className="flex-1 overflow-auto cmp-scroll p-8">
              <SubmissionForm form={form} setForm={setForm} onSaveDraft={() => handleSubmitForm("Draft")} onSubmit={() => handleSubmitForm("Submitted")} />
            </div>
          </>
        )}

        {view === "detail" && selected && (
          <>
            <TopBar title={selected.projectName} subtitle="Submission details" />
            <div className="flex-1 overflow-auto cmp-scroll p-8">
              <button onClick={() => setView("submissions")} className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-800 mb-5">
                <ArrowLeft size={13} /> Back to submissions
              </button>
              <SubmissionDetail data={selected} />
              {selected.status === "Selected" && (
                <button onClick={() => goProject(selected.id)} className="mt-6 text-sm font-medium bg-slate-900 text-white px-4 py-2.5 rounded-lg hover:bg-slate-800 flex items-center gap-2">
                  Go to Active Project <ChevronRight size={15} />
                </button>
              )}
            </div>
          </>
        )}

        {view === "project" && selected && (
          <>
            <TopBar title={selected.projectName} subtitle="Active project — progress & updates" />
            <div className="flex-1 overflow-auto cmp-scroll p-8">
              <button onClick={() => setView("submissions")} className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-800 mb-5">
                <ArrowLeft size={13} /> Back to submissions
              </button>
              <ActiveProject data={selected} onAddUpdate={addUpdate} onSubmitFinal={submitFinal} editable />
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function SubmissionsTable({ rows, onView, onOpenProject }) {
  return (
    <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wide">
            <th className="text-left font-medium px-4 py-3">Project / Tenure</th>
            <th className="text-left font-medium px-4 py-3">Location</th>
            <th className="text-left font-medium px-4 py-3">Budget</th>
            <th className="text-left font-medium px-4 py-3">Duration</th>
            <th className="text-left font-medium px-4 py-3">Submitted</th>
            <th className="text-left font-medium px-4 py-3">Status</th>
            <th className="text-left font-medium px-4 py-3">Action</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.id} className="border-t border-slate-100 hover:bg-slate-50/60">
              <td className="px-4 py-3 font-medium text-slate-800">{r.projectName}</td>
              <td className="px-4 py-3 text-slate-600">{r.location}</td>
              <td className="px-4 py-3 text-slate-600 cmp-data">{fmtINR(r.budget)}</td>
              <td className="px-4 py-3 text-slate-600">{r.duration}</td>
              <td className="px-4 py-3 text-slate-500 cmp-data">{r.submissionDate}</td>
              <td className="px-4 py-3"><StatusBadge status={r.status} /></td>
              <td className="px-4 py-3">
                <div className="flex items-center gap-3">
                  <button onClick={() => onView(r.id)} className="text-xs font-medium text-amber-600 hover:text-amber-700 flex items-center gap-1"><Eye size={13} /> View</button>
                  {r.status === "Selected" && onOpenProject && (
                    <button onClick={() => onOpenProject(r.id)} className="text-xs font-medium text-slate-600 hover:text-slate-900">Project</button>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function SubmissionForm({ form, setForm, onSaveDraft, onSubmit }) {
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });
  const handleFile = (e) => {
    const f = e.target.files[0];
    if (!f) return;
    setForm({ ...form, pdf: { name: f.name, type: "PDF", size: (f.size / (1024 * 1024)).toFixed(1) + " MB" } });
  };
  return (
    <div className="max-w-3xl">
      <div className="bg-white border border-slate-200 rounded-xl p-6 space-y-8">
        <section>
          <p className="text-xs font-semibold text-amber-600 mb-3">Project Details</p>
          <div className="grid sm:grid-cols-2 gap-4">
            <Field label="Project / Tenure Name" span={2}>
              <input className={inputCls} value={form.projectName} onChange={set("projectName")} placeholder="e.g. Jharia Access Road Rehabilitation" />
            </Field>
            <Field label="Project Description" span={2}>
              <textarea rows={3} className={inputCls} value={form.description} onChange={set("description")} placeholder="Describe the scope of work" />
            </Field>
            <Field label="Location">
              <input className={inputCls} value={form.location} onChange={set("location")} placeholder="e.g. Jharia, Jharkhand" />
            </Field>
            <Field label="Duration / Tenure">
              <input className={inputCls} value={form.duration} onChange={set("duration")} placeholder="e.g. 6 months" />
            </Field>
            <Field label="Expected Start Date">
              <input type="date" className={inputCls} value={form.startDate} onChange={set("startDate")} />
            </Field>
            <Field label="Expected End Date">
              <input type="date" className={inputCls} value={form.endDate} onChange={set("endDate")} />
            </Field>
          </div>
        </section>

        <section>
          <p className="text-xs font-semibold text-amber-600 mb-3">Requirements</p>
          <div className="grid gap-4">
            <Field label="Requirements"><textarea rows={2} className={inputCls} value={form.requirements} onChange={set("requirements")} placeholder="General project requirements" /></Field>
            <Field label="Skills / Resources Required"><textarea rows={2} className={inputCls} value={form.skillsResources} onChange={set("skillsResources")} /></Field>
            <Field label="Equipment / Material Requirements"><textarea rows={2} className={inputCls} value={form.equipment} onChange={set("equipment")} /></Field>
            <Field label="Other Requirements"><textarea rows={2} className={inputCls} value={form.otherRequirements} onChange={set("otherRequirements")} /></Field>
          </div>
        </section>

        <section>
          <p className="text-xs font-semibold text-amber-600 mb-3">Workforce</p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <Field label="Workers Required"><input type="number" className={inputCls} value={form.workersRequired} onChange={set("workersRequired")} /></Field>
            <Field label="Engineers Required"><input type="number" className={inputCls} value={form.engineersRequired} onChange={set("engineersRequired")} /></Field>
            <Field label="Supervisors Required"><input type="number" className={inputCls} value={form.supervisorsRequired} onChange={set("supervisorsRequired")} /></Field>
            <Field label="Other Personnel"><input type="number" className={inputCls} value={form.otherPersonnel} onChange={set("otherPersonnel")} /></Field>
          </div>
        </section>

        <section>
          <p className="text-xs font-semibold text-amber-600 mb-3">Budget</p>
          <div className="grid sm:grid-cols-2 gap-4">
            <Field label="Estimated Budget (₹)"><input type="number" className={inputCls} value={form.budget} onChange={set("budget")} placeholder="e.g. 1000000" /></Field>
            <Field label="Additional Cost / Details"><input className={inputCls} value={form.additionalCost} onChange={set("additionalCost")} /></Field>
          </div>
        </section>

        <section>
          <p className="text-xs font-semibold text-amber-600 mb-3">Other Information</p>
          <div className="grid gap-4">
            <Field label="Additional Notes"><textarea rows={2} className={inputCls} value={form.notes} onChange={set("notes")} /></Field>
            <Field label="Special Requirements"><textarea rows={2} className={inputCls} value={form.specialRequirements} onChange={set("specialRequirements")} /></Field>
          </div>
        </section>

        <section>
          <p className="text-xs font-semibold text-amber-600 mb-3">Supporting PDF <span className="text-slate-400 font-normal">(optional)</span></p>
          {form.pdf ? (
            <FileUploadCard file={form.pdf} onRemove={() => setForm({ ...form, pdf: null })} />
          ) : (
            <label className="flex items-center gap-2 border border-dashed border-slate-300 rounded-lg px-4 py-3 text-sm text-slate-500 cursor-pointer hover:border-amber-400 hover:text-amber-600 w-fit">
              <Upload size={15} /> Choose File
              <input type="file" accept="application/pdf" className="hidden" onChange={handleFile} />
            </label>
          )}
        </section>

        <div className="flex items-center gap-3 pt-2 border-t border-slate-100">
          <button onClick={onSaveDraft} className="flex items-center gap-1.5 text-sm font-medium text-slate-700 border border-slate-300 px-4 py-2.5 rounded-lg hover:bg-slate-50">
            <Save size={14} /> Save Draft
          </button>
          <button onClick={onSubmit} className="flex items-center gap-1.5 text-sm font-medium bg-amber-500 text-white px-5 py-2.5 rounded-lg hover:bg-amber-600">
            <Send size={14} /> Submit
          </button>
        </div>
      </div>
    </div>
  );
}

function DetailRow({ icon: Icon, label, value }) {
  return (
    <div className="flex items-start gap-3">
      <div className="w-8 h-8 rounded-md bg-slate-50 border border-slate-200 flex items-center justify-center shrink-0 mt-0.5">
        <Icon size={14} className="text-slate-500" />
      </div>
      <div className="min-w-0">
        <p className="text-xs text-slate-500">{label}</p>
        <p className="text-sm text-slate-800 font-medium mt-0.5">{value || "-"}</p>
      </div>
    </div>
  );
}

function SubmissionDetail({ data, onSelect, onReject, adminView }) {
  return (
    <div className="max-w-3xl bg-white border border-slate-200 rounded-xl p-6 space-y-7">
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">{data.projectName}</h2>
          {adminView && <p className="text-sm text-slate-500 mt-0.5">{data.contractor}</p>}
        </div>
        <StatusBadge status={data.status} />
      </div>
      <p className="text-sm text-slate-600 leading-relaxed">{data.description}</p>

      <div>
        <p className="text-xs font-semibold text-amber-600 mb-3">Project Details</p>
        <div className="grid sm:grid-cols-2 gap-4">
          <DetailRow icon={MapPin} label="Location" value={data.location} />
          <DetailRow icon={Calendar} label="Duration" value={data.duration} />
          <DetailRow icon={Calendar} label="Start Date" value={data.startDate} />
          <DetailRow icon={Calendar} label="End Date" value={data.endDate} />
        </div>
      </div>

      <div>
        <p className="text-xs font-semibold text-amber-600 mb-3">Requirements</p>
        <div className="space-y-3 text-sm text-slate-700">
          <p><span className="text-slate-500">General: </span>{data.requirements || "-"}</p>
          <p><span className="text-slate-500">Skills / Resources: </span>{data.skillsResources || "-"}</p>
          <p><span className="text-slate-500">Equipment: </span>{data.equipment || "-"}</p>
          <p><span className="text-slate-500">Other: </span>{data.otherRequirements || "-"}</p>
        </div>
      </div>

      <div>
        <p className="text-xs font-semibold text-amber-600 mb-3">Workforce</p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <DetailRow icon={Users} label="Workers" value={data.workersRequired} />
          <DetailRow icon={HardHat} label="Engineers" value={data.engineersRequired} />
          <DetailRow icon={Users} label="Supervisors" value={data.supervisorsRequired} />
          <DetailRow icon={Users} label="Other" value={data.otherPersonnel} />
        </div>
      </div>

      <div>
        <p className="text-xs font-semibold text-amber-600 mb-3">Budget</p>
        <div className="grid sm:grid-cols-2 gap-4">
          <DetailRow icon={IndianRupee} label="Estimated Budget" value={fmtINR(data.budget)} />
          <DetailRow icon={IndianRupee} label="Additional Cost" value={data.additionalCost} />
        </div>
      </div>

      {(data.notes || data.specialRequirements) && (
        <div>
          <p className="text-xs font-semibold text-amber-600 mb-3">Other Information</p>
          <div className="space-y-2 text-sm text-slate-700">
            <p><span className="text-slate-500">Notes: </span>{data.notes || "-"}</p>
            <p><span className="text-slate-500">Special Requirements: </span>{data.specialRequirements || "-"}</p>
          </div>
        </div>
      )}

      <div>
        <p className="text-xs font-semibold text-amber-600 mb-3">Supporting Document</p>
        {data.pdf ? <FileUploadCard file={data.pdf} /> : <p className="text-sm text-slate-400">No document uploaded</p>}
      </div>

      {adminView && data.status !== "Selected" && data.status !== "Rejected" && (
        <div className="flex items-center gap-3 pt-4 border-t border-slate-100">
          <button onClick={onSelect} className="flex items-center gap-1.5 text-sm font-medium bg-emerald-600 text-white px-4 py-2.5 rounded-lg hover:bg-emerald-700">
            <CheckCircle2 size={15} /> Select Contractor
          </button>
          <button onClick={onReject} className="flex items-center gap-1.5 text-sm font-medium text-rose-600 border border-rose-200 px-4 py-2.5 rounded-lg hover:bg-rose-50">
            <XCircle size={15} /> Reject
          </button>
        </div>
      )}
      {adminView && data.status === "Selected" && (
        <div className="pt-4 border-t border-slate-100 flex items-center gap-2 text-sm text-emerald-700">
          <CheckCircle2 size={15} /> This contractor has been selected for the project.
        </div>
      )}
    </div>
  );
}

/* ============================================================
   ACTIVE PROJECT (shared between contractor [editable] and admin [read-only])
   ============================================================ */
const emptyUpdateForm = { title: "", date: "", workCompleted: "", progress: "", workRemaining: "", issues: "", notes: "", files: [] };
const emptyFinalForm = { finalPercent: "", completionDate: "", summary: "", workCompleted: "", issues: "", remarks: "", files: [] };

function ActiveProject({ data, onAddUpdate, onSubmitFinal, editable }) {
  const [tab, setTab] = useState("overview");
  const [updateForm, setUpdateForm] = useState(emptyUpdateForm);
  const [finalForm, setFinalForm] = useState(emptyFinalForm);

  const tabs = [
    { key: "overview", label: "Overview" },
    { key: "updates", label: "Update History" },
    ...(editable ? [{ key: "new-update", label: "Post Update" }] : []),
    { key: "documents", label: "Maps & Documents" },
    { key: "final", label: "Final Update" },
  ];

  function addFileToForm(setFn, form, e) {
    const f = e.target.files[0];
    if (!f) return;
    const type = f.type.startsWith("image") ? "Image" : f.name.toLowerCase().includes("map") ? "Map" : "Document";
    setFn({ ...form, files: [...form.files, { name: f.name, type, size: (f.size / (1024 * 1024)).toFixed(1) + " MB" }] });
  }

  const allFiles = [
    ...(data.pdf ? [{ ...data.pdf, source: "Original tender document" }] : []),
    ...data.updates.flatMap((u) => u.files.map((f) => ({ ...f, source: `Update: ${u.title}` }))),
    ...(data.finalUpdate ? data.finalUpdate.files.map((f) => ({ ...f, source: "Final update" })) : []),
  ];

  return (
    <div className="max-w-4xl space-y-6">
      <div className="bg-white border border-slate-200 rounded-xl p-6">
        <div className="flex items-start justify-between mb-5">
          <div>
            <p className="text-xs text-slate-500">{data.location} · {data.duration}</p>
            <p className="text-sm text-slate-600 mt-1">{data.startDate} → {data.endDate}</p>
          </div>
          <StatusBadge status={data.finalUpdate ? "Selected" : "Selected"} />
        </div>
        <div className="flex items-center justify-between mb-1.5">
          <p className="text-xs font-medium text-slate-600">Project Progress</p>
          <p className="text-sm font-semibold text-slate-900 cmp-data">{data.currentProgress}%</p>
        </div>
        <ProgressBar value={data.currentProgress} tone={data.finalUpdate ? "emerald" : "amber"} />
        {data.finalUpdate && (
          <div className="mt-4 flex items-center gap-2 text-sm text-emerald-700 bg-emerald-50 px-3 py-2 rounded-lg">
            <CheckCircle2 size={15} /> Final Update Submitted — project marked complete.
          </div>
        )}
      </div>

      <div className="flex items-center gap-1 border-b border-slate-200 overflow-x-auto">
        {tabs.map((t) => (
          <button key={t.key} onClick={() => setTab(t.key)}
            className={`px-4 py-2.5 text-sm font-medium whitespace-nowrap border-b-2 -mb-px transition-colors ${
              tab === t.key ? "border-amber-500 text-slate-900" : "border-transparent text-slate-500 hover:text-slate-800"
            }`}>
            {t.label}
          </button>
        ))}
      </div>

      {tab === "overview" && (
        <div className="bg-white border border-slate-200 rounded-xl p-6 grid sm:grid-cols-2 gap-4">
          <DetailRow icon={FileText} label="Project Name" value={data.projectName} />
          <DetailRow icon={MapPin} label="Location" value={data.location} />
          <DetailRow icon={Calendar} label="Start Date" value={data.startDate} />
          <DetailRow icon={Calendar} label="Expected Completion" value={data.endDate} />
          <DetailRow icon={Users} label="Workforce" value={`${data.workersRequired} workers · ${data.engineersRequired} engineers`} />
          <DetailRow icon={IndianRupee} label="Budget" value={fmtINR(data.budget)} />
        </div>
      )}

      {tab === "updates" && (
        data.updates.length === 0
          ? <EmptyState icon={ClipboardList} title="No updates posted yet" subtitle="Progress updates will appear here as a timeline once submitted." />
          : (
            <div className="bg-white border border-slate-200 rounded-xl p-6">
              <div className="space-y-0">
                {data.updates.map((u, i) => (
                  <div key={u.id} className="flex gap-4 pb-6 last:pb-0">
                    <div className="flex flex-col items-center">
                      <div className="w-3 h-3 rounded-full bg-amber-500 mt-1.5 shrink-0" />
                      {i < data.updates.length - 1 && <div className="w-px flex-1 bg-slate-200 my-1" />}
                    </div>
                    <div className="flex-1 pb-1">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-semibold text-slate-900">Update #{i + 1}: {u.title}</p>
                        <span className="text-xs text-slate-500 cmp-data">{u.date}</span>
                      </div>
                      <p className="text-xs font-medium text-amber-600 mt-1">Progress: {u.progress}%</p>
                      <p className="text-sm text-slate-600 mt-1.5">{u.workCompleted}</p>
                      {u.workRemaining && <p className="text-xs text-slate-500 mt-1">Remaining: {u.workRemaining}</p>}
                      {u.issues && u.issues !== "None significant." && (
                        <p className="text-xs text-rose-600 mt-1 flex items-center gap-1"><AlertTriangle size={11} /> {u.issues}</p>
                      )}
                      {u.files.length > 0 && (
                        <div className="flex flex-wrap gap-2 mt-2.5">
                          {u.files.map((f, fi) => <FileUploadCard key={fi} file={f} icon={f.type === "Image" ? ImageIcon : f.type === "Map" ? MapPin : FileText} />)}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )
      )}

      {tab === "new-update" && editable && (
        <div className="bg-white border border-slate-200 rounded-xl p-6 space-y-4">
          <div className="grid sm:grid-cols-2 gap-4">
            <Field label="Update Title"><input className={inputCls} value={updateForm.title} onChange={(e) => setUpdateForm({ ...updateForm, title: e.target.value })} placeholder="e.g. Structural work started" /></Field>
            <Field label="Date"><input type="date" className={inputCls} value={updateForm.date} onChange={(e) => setUpdateForm({ ...updateForm, date: e.target.value })} /></Field>
          </div>
          <Field label="Work Completed"><textarea rows={2} className={inputCls} value={updateForm.workCompleted} onChange={(e) => setUpdateForm({ ...updateForm, workCompleted: e.target.value })} /></Field>
          <div className="grid sm:grid-cols-2 gap-4">
            <Field label="Current Progress %"><input type="number" min="0" max="100" className={inputCls} value={updateForm.progress} onChange={(e) => setUpdateForm({ ...updateForm, progress: e.target.value })} /></Field>
            <Field label="Work Remaining"><input className={inputCls} value={updateForm.workRemaining} onChange={(e) => setUpdateForm({ ...updateForm, workRemaining: e.target.value })} /></Field>
          </div>
          <Field label="Problems / Issues"><textarea rows={2} className={inputCls} value={updateForm.issues} onChange={(e) => setUpdateForm({ ...updateForm, issues: e.target.value })} /></Field>
          <Field label="Additional Notes"><textarea rows={2} className={inputCls} value={updateForm.notes} onChange={(e) => setUpdateForm({ ...updateForm, notes: e.target.value })} /></Field>
          <Field label="Attach Maps / Documents / Images">
            <label className="flex items-center gap-2 border border-dashed border-slate-300 rounded-lg px-4 py-3 text-sm text-slate-500 cursor-pointer hover:border-amber-400 hover:text-amber-600 w-fit">
              <Upload size={15} /> Choose File
              <input type="file" className="hidden" onChange={(e) => addFileToForm(setUpdateForm, updateForm, e)} />
            </label>
            {updateForm.files.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2.5">
                {updateForm.files.map((f, i) => (
                  <FileUploadCard key={i} file={f} icon={f.type === "Image" ? ImageIcon : f.type === "Map" ? MapPin : FileText}
                    onRemove={() => setUpdateForm({ ...updateForm, files: updateForm.files.filter((_, fi) => fi !== i) })} />
                ))}
              </div>
            )}
          </Field>
          <button
            onClick={() => {
              if (!updateForm.title || updateForm.progress === "") return;
              onAddUpdate({ id: Date.now(), ...updateForm, progress: Number(updateForm.progress) });
              setUpdateForm(emptyUpdateForm);
              setTab("updates");
            }}
            className="flex items-center gap-1.5 text-sm font-medium bg-amber-500 text-white px-5 py-2.5 rounded-lg hover:bg-amber-600"
          >
            <Send size={14} /> Submit Update
          </button>
        </div>
      )}

      {tab === "documents" && (
        allFiles.length === 0
          ? <EmptyState icon={ImageIcon} title="No maps or documents yet" subtitle="Files attached to updates or the original tender will appear here." />
          : (
            <div className="bg-white border border-slate-200 rounded-xl p-6">
              <div className="grid sm:grid-cols-2 gap-3">
                {allFiles.map((f, i) => (
                  <div key={i}>
                    <FileUploadCard file={f} icon={f.type === "Image" ? ImageIcon : f.type === "Map" ? MapPin : FileText} />
                    <p className="text-[11px] text-slate-400 mt-1 ml-1">{f.source}</p>
                  </div>
                ))}
              </div>
            </div>
          )
      )}

      {tab === "final" && (
        data.finalUpdate ? (
          <div className="bg-white border border-slate-200 rounded-xl p-6 space-y-4">
            <div className="flex items-center gap-2 text-emerald-700 bg-emerald-50 px-3 py-2.5 rounded-lg text-sm font-medium">
              <CheckCircle2 size={16} /> Final Update Submitted
            </div>
            <DetailRow icon={TrendingUp} label="Final Completion" value={`${data.finalUpdate.finalPercent}%`} />
            <DetailRow icon={Calendar} label="Completion Date" value={data.finalUpdate.completionDate} />
            <DetailRow icon={FileCheck} label="Final Work Summary" value={data.finalUpdate.summary} />
            <DetailRow icon={ClipboardList} label="Work Completed" value={data.finalUpdate.workCompleted} />
            <DetailRow icon={AlertTriangle} label="Issues Encountered" value={data.finalUpdate.issues} />
            <DetailRow icon={FileText} label="Final Remarks" value={data.finalUpdate.remarks} />
            {data.finalUpdate.files.length > 0 && (
              <div className="flex flex-wrap gap-2 pt-1">
                {data.finalUpdate.files.map((f, i) => <FileUploadCard key={i} file={f} icon={f.type === "Image" ? ImageIcon : f.type === "Map" ? MapPin : FileText} />)}
              </div>
            )}
          </div>
        ) : editable ? (
          <div className="bg-white border border-slate-200 rounded-xl p-6 space-y-4">
            <div className="grid sm:grid-cols-2 gap-4">
              <Field label="Final Completion %"><input type="number" min="0" max="100" className={inputCls} value={finalForm.finalPercent} onChange={(e) => setFinalForm({ ...finalForm, finalPercent: e.target.value })} /></Field>
              <Field label="Completion Date"><input type="date" className={inputCls} value={finalForm.completionDate} onChange={(e) => setFinalForm({ ...finalForm, completionDate: e.target.value })} /></Field>
            </div>
            <Field label="Final Work Summary"><textarea rows={2} className={inputCls} value={finalForm.summary} onChange={(e) => setFinalForm({ ...finalForm, summary: e.target.value })} /></Field>
            <Field label="Work Completed"><textarea rows={2} className={inputCls} value={finalForm.workCompleted} onChange={(e) => setFinalForm({ ...finalForm, workCompleted: e.target.value })} /></Field>
            <Field label="Issues Encountered"><textarea rows={2} className={inputCls} value={finalForm.issues} onChange={(e) => setFinalForm({ ...finalForm, issues: e.target.value })} /></Field>
            <Field label="Final Remarks"><textarea rows={2} className={inputCls} value={finalForm.remarks} onChange={(e) => setFinalForm({ ...finalForm, remarks: e.target.value })} /></Field>
            <Field label="Final Documents / Maps / Photos">
              <label className="flex items-center gap-2 border border-dashed border-slate-300 rounded-lg px-4 py-3 text-sm text-slate-500 cursor-pointer hover:border-amber-400 hover:text-amber-600 w-fit">
                <Upload size={15} /> Choose File
                <input type="file" className="hidden" onChange={(e) => addFileToForm(setFinalForm, finalForm, e)} />
              </label>
              {finalForm.files.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2.5">
                  {finalForm.files.map((f, i) => <FileUploadCard key={i} file={f} icon={f.type === "Image" ? ImageIcon : f.type === "Map" ? MapPin : FileText}
                    onRemove={() => setFinalForm({ ...finalForm, files: finalForm.files.filter((_, fi) => fi !== i) })} />)}
                </div>
              )}
            </Field>
            <button
              onClick={() => {
                if (finalForm.finalPercent === "" || !finalForm.completionDate) return;
                onSubmitFinal({ ...finalForm, finalPercent: Number(finalForm.finalPercent) });
              }}
              className="flex items-center gap-1.5 text-sm font-medium bg-emerald-600 text-white px-5 py-2.5 rounded-lg hover:bg-emerald-700"
            >
              <CheckCircle2 size={15} /> Submit Final Update
            </button>
          </div>
        ) : (
          <EmptyState icon={FileCheck} title="Final update not yet submitted" subtitle="This will appear once the contractor marks the project complete." />
        )
      )}
    </div>
  );
}

/* ============================================================
   ADMIN APP
   ============================================================ */
function AdminApp({ submissions, setSubmissions, onExit }) {
  const [view, setView] = useState("dashboard");
  const [selectedId, setSelectedId] = useState(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  const selected = submissions.find((s) => s.id === selectedId);

  const navItems = [
    { key: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    { key: "submissions", label: "All Submissions", icon: FileText },
  ];

  function goDetail(id) { setSelectedId(id); setView("detail"); }
  function goProject(id) { setSelectedId(id); setView("project"); }

  function selectContractor() {
    setSubmissions((prev) => prev.map((s) => s.id === selectedId ? { ...s, status: "Selected" } : s));
  }
  function rejectContractor() {
    setSubmissions((prev) => prev.map((s) => s.id === selectedId ? { ...s, status: "Rejected" } : s));
  }
  function addUpdate(update) {
    setSubmissions((prev) => prev.map((s) => s.id === selectedId ? { ...s, currentProgress: update.progress, updates: [...s.updates, update] } : s));
  }

  const filtered = submissions.filter((s) => {
    const matchesSearch = (s.projectName + s.contractor).toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === "All" || s.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const activeProjects = submissions.filter((s) => s.status === "Selected");

  return (
    <div className="cmp-root flex h-full w-full bg-[#F7F5F1]">
      <GlobalStyle />
      <Sidebar role="admin" items={navItems} active={["detail", "project"].includes(view) ? "submissions" : view}
        onNavigate={(k) => { setView(k); setSelectedId(null); }} onExit={onExit} contractorName="Project Manager" />
      <div className="flex-1 flex flex-col min-w-0">
        {view === "dashboard" && (
          <>
            <TopBar title="Dashboard" subtitle="Overview of all contractor submissions and active projects" />
            <div className="flex-1 overflow-auto cmp-scroll p-8">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
                <StatCard label="Total submissions" value={submissions.length} icon={FileText} tone="slate" />
                <StatCard label="Pending review" value={submissions.filter(s => s.status === "Submitted" || s.status === "Under Review").length} icon={Clock} tone="amber" />
                <StatCard label="Active projects" value={activeProjects.length} icon={TrendingUp} tone="emerald" />
                <StatCard label="Rejected" value={submissions.filter(s => s.status === "Rejected").length} icon={XCircle} tone="sky" />
              </div>

              <p className="text-sm font-semibold text-slate-800 mb-3">Active Projects</p>
              {activeProjects.length === 0 ? (
                <EmptyState icon={TrendingUp} title="No active projects" subtitle="Selected contractors will appear here with live progress." />
              ) : (
                <div className="grid sm:grid-cols-2 gap-4 mb-8">
                  {activeProjects.map((p) => (
                    <button key={p.id} onClick={() => goProject(p.id)} className="text-left bg-white border border-slate-200 rounded-xl p-4 hover:border-amber-400 hover:shadow-sm transition-all">
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-sm font-semibold text-slate-900">{p.projectName}</p>
                        <span className="text-xs text-slate-500 cmp-data">{p.currentProgress}%</span>
                      </div>
                      <p className="text-xs text-slate-500 mb-3">{p.contractor}</p>
                      <ProgressBar value={p.currentProgress} tone="emerald" />
                    </button>
                  ))}
                </div>
              )}

              <div className="flex items-center justify-between mb-3">
                <p className="text-sm font-semibold text-slate-800">Recent submissions</p>
                <button onClick={() => setView("submissions")} className="text-xs font-medium text-amber-600 hover:text-amber-700">View all</button>
              </div>
              <AdminTable rows={submissions.slice(0, 5)} onView={goDetail} />
            </div>
          </>
        )}

        {view === "submissions" && (
          <>
            <TopBar title="All Submissions" subtitle="Review and manage contractor submissions" />
            <div className="flex-1 overflow-auto cmp-scroll p-8">
              <div className="flex items-center gap-3 mb-5">
                <div className="relative flex-1 max-w-xs">
                  <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search contractor or project..."
                    className={inputCls + " pl-8"} />
                </div>
                <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className={inputCls + " w-44"}>
                  {["All", "Draft", "Submitted", "Under Review", "Selected", "Rejected"].map((s) => <option key={s}>{s}</option>)}
                </select>
              </div>
              {filtered.length === 0
                ? <EmptyState icon={Search} title="No matching submissions" subtitle="Try a different search term or filter." />
                : <AdminTable rows={filtered} onView={goDetail} />}
            </div>
          </>
        )}

        {view === "detail" && selected && (
          <>
            <TopBar title={selected.projectName} subtitle="Submission review" />
            <div className="flex-1 overflow-auto cmp-scroll p-8">
              <button onClick={() => setView("submissions")} className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-800 mb-5">
                <ArrowLeft size={13} /> Back to submissions
              </button>
              <SubmissionDetail data={selected} adminView onSelect={selectContractor} onReject={rejectContractor} />
              {selected.status === "Selected" && (
                <button onClick={() => goProject(selected.id)} className="mt-6 text-sm font-medium bg-slate-900 text-white px-4 py-2.5 rounded-lg hover:bg-slate-800 flex items-center gap-2">
                  Monitor Active Project <ChevronRight size={15} />
                </button>
              )}
            </div>
          </>
        )}

        {view === "project" && selected && (
          <>
            <TopBar title={selected.projectName} subtitle={`Monitoring — ${selected.contractor}`} />
            <div className="flex-1 overflow-auto cmp-scroll p-8">
              <button onClick={() => setView("submissions")} className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-800 mb-5">
                <ArrowLeft size={13} /> Back to submissions
              </button>
              <ActiveProject data={selected} editable={false} />
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function AdminTable({ rows, onView }) {
  return (
    <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wide">
            <th className="text-left font-medium px-4 py-3">Contractor</th>
            <th className="text-left font-medium px-4 py-3">Project</th>
            <th className="text-left font-medium px-4 py-3">Budget</th>
            <th className="text-left font-medium px-4 py-3">Duration</th>
            <th className="text-left font-medium px-4 py-3">Status</th>
            <th className="text-left font-medium px-4 py-3">Action</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.id} className="border-t border-slate-100 hover:bg-slate-50/60">
              <td className="px-4 py-3 font-medium text-slate-800">{r.contractor}</td>
              <td className="px-4 py-3 text-slate-600">{r.projectName}</td>
              <td className="px-4 py-3 text-slate-600 cmp-data">{fmtINR(r.budget)}</td>
              <td className="px-4 py-3 text-slate-600">{r.duration}</td>
              <td className="px-4 py-3"><StatusBadge status={r.status} /></td>
              <td className="px-4 py-3">
                <button onClick={() => onView(r.id)} className="text-xs font-medium text-amber-600 hover:text-amber-700 flex items-center gap-1"><Eye size={13} /> View</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/* ============================================================
   ROOT APP
   ============================================================ */
export default function App() {
  const [screen, setScreen] = useState("landing");
  const [submissions, setSubmissions] = useState(seedSubmissions);

  return (
    <div className="w-full h-[calc(100vh-2rem)] min-h-[640px] rounded-xl overflow-hidden border border-slate-200">
      {screen === "landing" && <Landing onSelect={setScreen} />}
      {screen === "contractor" && <ContractorApp submissions={submissions} setSubmissions={setSubmissions} onExit={() => setScreen("landing")} />}
      {screen === "admin" && <AdminApp submissions={submissions} setSubmissions={setSubmissions} onExit={() => setScreen("landing")} />}
    </div>
  );
}

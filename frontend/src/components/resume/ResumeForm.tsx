import { FiPlus, FiTrash2, FiUser, FiMail, FiPhone, FiMapPin, FiLinkedin, FiGithub, FiFileText, FiCode, FiBriefcase, FiCalendar, FiBox, FiAlignLeft, FiBook, FiAward, FiHash } from "react-icons/fi";

// ─── Reusable Input ───────────────────────────────────────────────────────────
function Input({ label, value, onChange, placeholder, type = "text", icon }: any) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 w-full">
      <div className="sm:w-[160px] flex items-center gap-3 shrink-0">
        {icon && (
          <div className="w-8 h-8 rounded-md bg-[#F4F7FF] flex items-center justify-center text-blue-600 shrink-0">
            {icon}
          </div>
        )}
        <label className="text-[11px] font-bold text-[#0A0A0A] uppercase tracking-wide">
          {label}
        </label>
      </div>
      <input
        type={type}
        value={value}
        onChange={(e: any) => onChange(e.target.value)}
        placeholder={placeholder}
        className="flex-1 bg-white border border-black/15 text-[#0A0A0A] text-sm rounded-xl px-4 py-2.5 outline-none focus:border-blue-600 focus:ring-4 focus:ring-blue-600/10 transition-all placeholder-black/30 shadow-sm w-full"
      />
    </div>
  );
}

// ─── Reusable Textarea ────────────────────────────────────────────────────────
function Textarea({ label, value, onChange, placeholder, rows = 3, icon }: any) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-start gap-2 sm:gap-4 w-full">
      <div className="sm:w-[160px] flex items-center gap-3 shrink-0 sm:pt-2">
        {icon && (
          <div className="w-8 h-8 rounded-md bg-[#F4F7FF] flex items-center justify-center text-blue-600 shrink-0">
            {icon}
          </div>
        )}
        <label className="text-[11px] font-bold text-[#0A0A0A] uppercase tracking-wide">
          {label}
        </label>
      </div>
      <textarea
        value={value}
        onChange={(e: any) => onChange(e.target.value)}
        placeholder={placeholder}
        rows={rows}
        className="flex-1 bg-white border border-black/15 text-[#0A0A0A] text-sm rounded-xl px-4 py-3 outline-none focus:border-blue-600 focus:ring-4 focus:ring-blue-600/10 transition-all placeholder-black/30 resize-none shadow-sm w-full"
      />
    </div>
  );
}

// ─── Add / Remove Entry Card ──────────────────────────────────────────────────
function EntryCard({ children, onRemove }: any) {
  return (
    <div className="relative overflow-hidden bg-[#F8F9FA] border-2 border-black/15 rounded-xl p-3 shadow-[0_2px_10px_rgba(0,0,0,0.05)]">
      <button
        onClick={onRemove}
        className="absolute top-2.5 right-2.5 z-10 text-black/35 hover:text-red-500 transition-colors"
      >
        <FiTrash2 size={13} />
      </button>
      <div className="relative flex flex-col gap-2.5 pr-6">{children}</div>
    </div>
  );
}

// ─── Main ResumeForm ──────────────────────────────────────────────────────────
export default function ResumeForm({ step, data, setData }: any) {

  // ── Step 1: Personal Info ──────────────────────────────────────────────────
  if (step === 1) {
    return (
      <div className="flex flex-col gap-5">
        <Input icon={<FiUser size={15} />} label="Full Name"   value={data.name}     onChange={(v: any) => setData({ ...data, name: v })}     placeholder="Rahul Sharma" />
        <Input icon={<FiMail size={15} />} label="Email"       value={data.email}    onChange={(v: any) => setData({ ...data, email: v })}    placeholder="rahul@email.com" />
        <Input icon={<FiPhone size={15} />} label="Phone"       value={data.phone}    onChange={(v: any) => setData({ ...data, phone: v })}    placeholder="+91 9876543210" />
        <Input icon={<FiMapPin size={15} />} label="Location"    value={data.location} onChange={(v: any) => setData({ ...data, location: v })} placeholder="Jhansi, Uttar Pradesh" />
        <Input icon={<FiLinkedin size={15} />} label="LinkedIn URL" value={data.linkedin} onChange={(v: any) => setData({ ...data, linkedin: v })} placeholder="linkedin.com/in/rahul" />
        <Input icon={<FiGithub size={15} />} label="GitHub URL"   value={data.github}  onChange={(v: any) => setData({ ...data, github: v })}   placeholder="github.com/rahul" />
      </div>
    );
  }

  // ── Step 2: Summary ────────────────────────────────────────────────────────
  if (step === 2) {
    return (
      <div className="flex flex-col gap-5">
        <Textarea
          icon={<FiFileText size={15} />}
          label="Professional Summary"
          value={data.summary}
          onChange={(v: any) => setData({ ...data, summary: v })}
          placeholder="Backend Developer with 2+ years of experience building scalable Node.js and MongoDB applications..."
          rows={5}
        />
        <p className="text-xs text-black/40 pl-[176px]">Leave empty to skip this section.</p>
      </div>
    );
  }

  // ── Step 3: Skills ─────────────────────────────────────────────────────────
  if (step === 3) {
    return (
      <div className="flex flex-col gap-5">
        <Textarea
          icon={<FiCode size={15} />}
          label="Skills"
          value={data.skills}
          onChange={(v: any) => setData({ ...data, skills: v })}
          placeholder="JavaScript, TypeScript, React, Node.js, Express, MongoDB, Redis, Docker, AWS, Git"
          rows={4}
        />
        <p className="text-xs text-black/40 pl-[176px]">Separate each skill with a comma.</p>
      </div>
    );
  }

  // ── Step 4: Experience ─────────────────────────────────────────────────────
  if (step === 4) {
    const addExp = () => {
      setData({
        ...data,
        experience: [...data.experience, { company: "", role: "", duration: "", description: "" }],
      });
    };

    const updateExp = (index: number, field: string, value: string) => {
      const updated = data.experience.map((exp: any, i: number) =>
        i === index ? { ...exp, [field]: value } : exp
      );
      setData({ ...data, experience: updated });
    };

    const removeExp = (index: number) => {
      setData({ ...data, experience: data.experience.filter((_: any, i: number) => i !== index) });
    };

    return (
      <div className="flex flex-col gap-3">
        {data.experience.length === 0 && (
          <p className="text-xs text-black/40 text-center py-3">
            No experience added yet. Click below to add.
          </p>
        )}

        {data.experience.map((exp: any, index: number) => (
          <EntryCard key={index} onRemove={() => removeExp(index)}>
            <Input icon={<FiBriefcase size={15} />} label="Company"  value={exp.company}     onChange={(v: any) => updateExp(index, "company", v)}     placeholder="ABC Technologies" />
            <Input icon={<FiAward size={15} />} label="Role"     value={exp.role}        onChange={(v: any) => updateExp(index, "role", v)}        placeholder="Backend Developer" />
            <Input icon={<FiCalendar size={15} />} label="Duration" value={exp.duration}    onChange={(v: any) => updateExp(index, "duration", v)}    placeholder="Jan 2023 – Dec 2024" />
            <Textarea icon={<FiAlignLeft size={15} />} label="Description" value={exp.description} onChange={(v: any) => updateExp(index, "description", v)} placeholder={"• Built REST APIs\n• Improved performance by 40%"} />
          </EntryCard>
        ))}

        <button
          onClick={addExp}
          className="flex items-center justify-center gap-1.5 w-full py-2.5 border border-dashed border-black/20 rounded-xl text-xs text-black/45 hover:border-black/40 hover:text-[#0A0A0A] transition-all"
        >
          <FiPlus size={13} />
          Add Experience
        </button>
      </div>
    );
  }

  // ── Step 5: Projects ───────────────────────────────────────────────────────
  if (step === 5) {
    const addProject = () => {
      setData({
        ...data,
        projects: [...data.projects, { name: "", techStack: "", github: "", description: "" }],
      });
    };

    const updateProject = (index: number, field: string, value: string) => {
      const updated = data.projects.map((proj: any, i: number) =>
        i === index ? { ...proj, [field]: value } : proj
      );
      setData({ ...data, projects: updated });
    };

    const removeProject = (index: number) => {
      setData({ ...data, projects: data.projects.filter((_: any, i: number) => i !== index) });
    };

    return (
      <div className="flex flex-col gap-3">
        {data.projects.length === 0 && (
          <p className="text-xs text-black/40 text-center py-3">
            No projects added yet. Projects are very important for freshers!
          </p>
        )}

        {data.projects.map((proj: any, index: number) => (
          <EntryCard key={index} onRemove={() => removeProject(index)}>
            <Input icon={<FiBox size={15} />} label="Project Name" value={proj.name}      onChange={(v: any) => updateProject(index, "name", v)}      placeholder="InterviewOS" />
            <Input icon={<FiCode size={15} />} label="Tech Stack"   value={proj.techStack} onChange={(v: any) => updateProject(index, "techStack", v)} placeholder="React, Node.js, MongoDB" />
            <Input icon={<FiGithub size={15} />} label="GitHub Link"  value={proj.github}    onChange={(v: any) => updateProject(index, "github", v)}    placeholder="github.com/rahul/interviewos" />
            <Textarea icon={<FiAlignLeft size={15} />} label="Description" value={proj.description} onChange={(v: any) => updateProject(index, "description", v)} placeholder="AI-powered interview preparation platform with mock interviews and resume builder." />
          </EntryCard>
        ))}

        <button
          onClick={addProject}
          className="flex items-center justify-center gap-1.5 w-full py-2.5 border border-dashed border-black/20 rounded-xl text-xs text-black/45 hover:border-black/40 hover:text-[#0A0A0A] transition-all"
        >
          <FiPlus size={13} />
          Add Project
        </button>
      </div>
    );
  }

  // ── Step 6: Education ──────────────────────────────────────────────────────
  if (step === 6) {
    const addEdu = () => {
      setData({
        ...data,
        education: [...data.education, { college: "", degree: "", branch: "", cgpa: "", year: "" }],
      });
    };

    const updateEdu = (index: number, field: string, value: string) => {
      const updated = data.education.map((edu: any, i: number) =>
        i === index ? { ...edu, [field]: value } : edu
      );
      setData({ ...data, education: updated });
    };

    const removeEdu = (index: number) => {
      setData({ ...data, education: data.education.filter((_: any, i: number) => i !== index) });
    };

    return (
      <div className="flex flex-col gap-3">
        {data.education.length === 0 && (
          <p className="text-xs text-black/40 text-center py-3">
            No education added yet.
          </p>
        )}

        {data.education.map((edu: any, index: number) => (
          <EntryCard key={index} onRemove={() => removeEdu(index)}>
            <Input icon={<FiBook size={15} />} label="College" value={edu.college} onChange={(v: any) => updateEdu(index, "college", v)} placeholder="SR Group of Institutions" />
            <Input icon={<FiAward size={15} />} label="Degree"  value={edu.degree} onChange={(v: any) => updateEdu(index, "degree", v)} placeholder="B.Tech" />
            <Input icon={<FiBox size={15} />} label="Branch"  value={edu.branch} onChange={(v: any) => updateEdu(index, "branch", v)} placeholder="Computer Science" />
            <Input icon={<FiHash size={15} />} label="CGPA"    value={edu.cgpa}   onChange={(v: any) => updateEdu(index, "cgpa", v)}   placeholder="8.5" />
            <Input icon={<FiCalendar size={15} />} label="Year"    value={edu.year}   onChange={(v: any) => updateEdu(index, "year", v)}   placeholder="2021 – 2025" />
          </EntryCard>
        ))}

        <button
          onClick={addEdu}
          className="flex items-center justify-center gap-1.5 w-full py-2.5 border border-dashed border-black/20 rounded-xl text-xs text-black/45 hover:border-black/40 hover:text-[#0A0A0A] transition-all"
        >
          <FiPlus size={13} />
          Add Education
        </button>
      </div>
    );
  }

  return null;
}
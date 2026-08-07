import { FiDownload } from "react-icons/fi";
import { useReactToPrint } from "react-to-print";
import api from "../../utils/axios";
import { getCurrentUser } from "../../api/user.api";

export default function DownloadButton({
  resumeRef,
  setUser,
}: any) {

  const handlePrint = useReactToPrint({
    contentRef: resumeRef,
    documentTitle: "PrepSphere",
  });

  const handleDownload = async () => {
    try {

      // Deduct 10 Coins via Backend
      await api.post("/api/resume/charge-download");

      // Fetch updated user stats since coins were deducted by the backend
      const meRes = await getCurrentUser();
      if (meRes?.user) {
        setUser(meRes.user);
      }

      // Download PDF
      handlePrint();

    } catch (error: any) {

      if (error.response?.status === 403) {
        return alert("Not enough Interview Coins.");
      }

      alert(
        error.response?.data?.message ||
        "Something went wrong."
      );
    }
  };

  return (
    <button
      onClick={handleDownload}
      className="flex items-center gap-2 rounded-lg bg-black px-3 py-3 text-xs text-white"
    >
      <FiDownload />
      Download PDF
    </button>
  );
}
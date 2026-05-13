import { Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function ProformaInvoice(){

      const navigate = useNavigate();



    return(
        <>
        <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Proforma Invoice</h1>
          <p className="text-sm text-gray-500 mt-1">Manage and generate export Invoice</p>
        </div>
        <button
        onClick={() => navigate('/proformainvoice/generate')}
          className="bg-[#003366] text-white px-5 py-2.5 rounded-xl font-bold text-sm flex items-center gap-2 hover:bg-[#004080] transition-all shadow-lg active:scale-95"
        >
          <Plus className="w-4 h-4" />
          Generate Invoice
        </button>
      </div>

        </>
    )
}
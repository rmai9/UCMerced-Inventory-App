import React, { useState } from 'react';
import { CloseIcon, EmailIcon, ExportIcon } from './icons';

interface EmailExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  buildingName: string;
  selectedDate: string;
  onGenerateAndDownload: () => string; // This function is expected to return the filename of the downloaded file.
}

/**
 * A modal that provides options for exporting the inventory report.
 * Users can either download the Excel file directly or open their default
 * email client with a pre-filled `mailto:` link.
 */
const EmailExportModal: React.FC<EmailExportModalProps> = ({ isOpen, onClose, buildingName, selectedDate, onGenerateAndDownload }) => {
  const [email, setEmail] = useState('');

  /**
   * Handles the "Just Download" action. It triggers the file download and closes the modal.
   */
  const handleDownloadOnly = () => {
    onGenerateAndDownload();
    onClose();
  };

  /**
   * Handles the "Email Report" action. It triggers the file download and then
   * opens a `mailto:` link in the user's default email client.
   */
  const handleEmail = (e: React.FormEvent) => {
    e.preventDefault();
    const fileName = onGenerateAndDownload();
    
    // Only proceed if a filename was returned, indicating a successful download.
    if (fileName) {
        const subject = encodeURIComponent(`Inventory Report: ${buildingName} - ${selectedDate}`);
        const body = encodeURIComponent(
            `Hello,\n\nPlease find the inventory report for ${buildingName} from ${selectedDate} attached.\n\n(You will need to manually attach the file named "${fileName}" that was just downloaded to your device.)\n\nThank you.`
        );
        
        // Open the user's default email client.
        window.location.href = `mailto:${email}?subject=${subject}&body=${body}`;
    }
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4" aria-modal="true" role="dialog">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg transform transition-all">
        <div className="flex justify-between items-center p-4 border-b">
          <h2 className="text-xl font-bold text-dark">Export Inventory Report</h2>
          <button onClick={onClose} className="p-1 rounded-full text-gray-500 hover:bg-gray-200" aria-label="Close modal">
            <CloseIcon className="w-6 h-6" />
          </button>
        </div>
        
        <form onSubmit={handleEmail}>
            <div className="p-6 sm:p-8 space-y-4">
                <p className="text-sm text-gray-600">You can email the report or simply download the Excel file to your device.</p>
                <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Recipient's Email Address</label>
                    <input 
                        id="email" 
                        name="email" 
                        type="email" 
                        value={email} 
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="recipient@example.com"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-secondary focus:border-secondary transition" 
                    />
                </div>
                 <p className="text-xs text-gray-500 italic">
                    Note: Clicking 'Email Report' will download the file and open your default email app. You must manually attach the downloaded file due to browser security policies.
                 </p>
            </div>
            
            <div className="px-6 py-4 bg-gray-50 border-t rounded-b-xl flex flex-col sm:flex-row-reverse gap-3">
                <button
                    type="submit"
                    className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-2 bg-secondary text-secondary-text font-semibold rounded-full shadow-md hover:bg-dark transition-colors"
                >
                    <EmailIcon className="w-5 h-5" />
                    Email Report
                </button>
                 <button
                    type="button"
                    onClick={handleDownloadOnly}
                    className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-2 bg-white text-gray-700 font-semibold border border-gray-300 rounded-full shadow-sm hover:bg-gray-50 transition-colors"
                >
                    <ExportIcon className="w-5 h-5" />
                    Just Download
                </button>
            </div>
        </form>
      </div>
    </div>
  );
};

export default EmailExportModal;

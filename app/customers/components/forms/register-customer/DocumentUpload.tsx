import { Upload, Loader2, CheckCircle2, X } from "lucide-react";

interface DocumentUploadProps {
  isCompressing: boolean;
  compressedFiles: File[];
  handleImageUpload: (event: React.ChangeEvent<HTMLInputElement>) => void;
  removeFile: (index: number) => void;
}

export const DocumentUpload = ({
  isCompressing,
  compressedFiles,
  handleImageUpload,
  removeFile,
}: DocumentUploadProps) => {
  return (
    <div className="space-y-2">
      <label className="flex items-center gap-2 font-medium text-muted-foreground text-sm">
        <Upload className="w-4 h-4 text-primary" /> Documents / ID
      </label>

      <div className="group relative">
        <div
          className={`flex flex-col justify-center items-center border-2 border-dashed ${
            isCompressing
              ? "border-primary/50 bg-primary/5 cursor-wait"
              : "border-border hover:border-primary/50 hover:bg-accent/50 cursor-pointer"
          } rounded-xl h-32 transition-all`}
        >
          {isCompressing ? (
            <div className="flex flex-col items-center animate-pulse">
              <Loader2 className="mb-2 w-8 h-8 text-primary animate-spin" />
              <p className="font-medium text-primary text-sm">
                Compressing & Optimizing...
              </p>
            </div>
          ) : (
            <>
              <div className="bg-accent mb-2 p-3 rounded-full text-primary group-hover:scale-110 transition-transform">
                <Upload className="w-6 h-6" />
              </div>
              <p className="font-medium text-muted-foreground text-sm">
                Click to upload documents
              </p>
              <p className="text-muted-foreground/60 text-xs">
                Images are auto-compressed (Max 200kb)
              </p>
            </>
          )}
        </div>
        <input
          type="file"
          multiple
          disabled={isCompressing}
          onChange={handleImageUpload}
          className="absolute inset-0 opacity-0"
          accept="image/*,application/pdf"
        />
      </div>

      {/* Uploaded Files Preview List */}
      {compressedFiles.length > 0 && (
        <div className="gap-2 grid grid-cols-1 sm:grid-cols-2 mt-2">
          {compressedFiles.map((file, idx) => (
            <div
              key={idx}
              className="slide-in-from-bottom-2 flex justify-between items-center bg-card/50 px-3 py-2 border border-border rounded-lg animate-in fade-in"
            >
              <div className="flex items-center gap-2 overflow-hidden">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                <div className="flex flex-col overflow-hidden">
                  <span className="font-medium text-foreground/80 text-xs truncate">
                    {file.name}
                  </span>
                  <span className="text-[10px] text-muted-foreground/60">
                    {(file.size / 1024).toFixed(0)} KB
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => removeFile(idx)}
                className="hover:bg-red-500/20 p-1 rounded text-muted-foreground/60 hover:text-red-400 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

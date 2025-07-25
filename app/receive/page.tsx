"use client";

import { importPrivateNote } from "@/lib/actions";
import { Loader2 } from "lucide-react";
import { use, useEffect, useState } from "react";
import { toast } from "sonner";

export default function ReceivePage() {
    const searchParams = new URLSearchParams(window.location.search);
    const [noteBytes, setNoteBytes] = useState<number[] | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [success, setSuccess] = useState<boolean>(false);
    const note = searchParams.get('note');

    useEffect(() => {
        if (!note) return;
        const noteBytes = atob(note.replace(/_/g, '/').replace(/-/g, '+').padEnd(note.length + (4 - note.length % 4) % 4, '='))
            .split('').map(c => c.charCodeAt(0));
        setNoteBytes(noteBytes);
    }, [note]);

    useEffect(() => {
        if (!noteBytes) return;
        (async () => {
            try {
                await importPrivateNote(noteBytes);
                setSuccess(true);
            } catch (error) {
                console.error("Error importing note:", error);
                toast.error("Failed to import note. Please ask for the link again");
            } finally {
                setLoading(false);
            }
        })();
    }, [noteBytes]);

    return (
        <div className="flex flex-col items-center justify-center min-h-[60vh]">
            {loading && (
                <div className="flex flex-col items-center gap-4">
                    <Loader2 className="animate-spin h-8 w-8 text-primary" />
                    <span className="text-muted-foreground text-sm">Importing note...</span>
                </div>
            )}
            {!loading && success && (
                <div className="flex flex-col items-center gap-4">
                    <span className="text-lg font-semibold">Note imported successfully!</span>
                    <span className="text-muted-foreground text-sm">You can now open your wallet to view your balance.</span>
                    <a href="/wallet" className="mt-2 px-4 py-2 bg-primary text-white rounded hover:bg-primary/90 transition">Open Wallet</a>
                </div>
            )}
        </div>
    );
}
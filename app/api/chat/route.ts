import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextRequest, NextResponse } from "next/server";
import { ChatRequest, ChatResponse } from "@/app/types";

export async function POST(request: NextRequest): Promise<NextResponse<ChatResponse>> {
    try {
        // Log untuk debugging
        console.log("API route dipanggil");
        
        // Periksa API key
        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) {
        console.error("API Key tidak ditemukan");
        return NextResponse.json(
            { response: "Error: API key tidak dikonfigurasi di server" },
            { status: 500 }
        );
        }

        // Parse request body
        let reqBody;
        try {
        reqBody = await request.json();
        } catch (error) {
        console.error("Gagal memparse JSON request:", error);
        return NextResponse.json(
            { response: "Error: Format request tidak valid" },
            { status: 400 }
        );
        }

        const { messages } = reqBody as ChatRequest;
        
        if (!messages || !Array.isArray(messages) || messages.length === 0) {
        console.error("Format messages tidak valid:", messages);
        return NextResponse.json(
            { response: "Error: Format messages tidak valid" },
            { status: 400 }
        );
        }
        
        // Inisialisasi Gemini API
        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
        
        // Persiapkan riwayat chat jika ada
        interface ChatHistoryItem {
        role: 'user' | 'model';
        parts: { text: string }[];
        }
        let chatHistory: ChatHistoryItem[] = [];
        if (messages.length > 1) {
        chatHistory = messages.slice(0, -1).map(msg => ({
            role: msg.role === "user" ? "user" : "model",
            parts: [{ text: msg.content }],
        }));
        }
        
        // Ambil pesan terakhir untuk dikirim
        const lastMessage = messages[messages.length - 1].content;
        
        // Buat chat instance
        const chat = model.startChat({
        history: chatHistory,
        });
        
        // Kirim pesan dan dapatkan respons
        console.log("Mengirim pesan ke Gemini:", lastMessage);
        const result = await chat.sendMessage(lastMessage);
        const response = result.response.text();
        console.log("Respon dari Gemini:", response.substring(0, 100) + "...");
        
        return NextResponse.json({ response });
    } catch (error) {
        // Log error detail
        console.error("Error detail:", error);
        
        // Kembalikan pesan error yang lebih informatif
        const errorMessage = error instanceof Error 
        ? `Error: ${error.message}` 
        : "Error tidak diketahui saat memproses permintaan";
        
        return NextResponse.json(
        { response: errorMessage },
        { status: 500 }
        );
    }
}
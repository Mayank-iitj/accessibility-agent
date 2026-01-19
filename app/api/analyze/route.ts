import { NextRequest, NextResponse } from 'next/server';
import { analyzeContent } from '@/lib/gemini';

export async function POST(req: NextRequest) {
    try {
        const data = await req.json();
        const { content, type, imageData } = data;

        if (!content && !imageData) {
            return NextResponse.json({ error: "No content provided" }, { status: 400 });
        }

        const analysis = await analyzeContent(content || "Analyze this image", type, imageData);

        return NextResponse.json(analysis);
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: "Analysis failed" }, { status: 500 });
    }
}

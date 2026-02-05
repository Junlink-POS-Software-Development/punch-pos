import { GoogleGenerativeAI, } from "@google/generative-ai";
import { NextRequest, NextResponse } from "next/server";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");
console.log("Gemini API Key exists:", !!process.env.GEMINI_API_KEY);


export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const image = formData.get("image") as File;

    if (!image) {
      return NextResponse.json({ error: "No image provided" }, { status: 400 });
    }

    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json(
        { error: "Gemini API key not configured" },
        { status: 500 }
      );
    }

    

    const model = genAI.getGenerativeModel({ model: "gemini-flash-latest" });
  

    const imageData = await image.arrayBuffer();
    const imageBase64 = Buffer.from(imageData).toString("base64");

    const prompt = `
      Extract customer information from this document image. 
      Return the data in a strict JSON format with the following fields:
      - full_name: string
      - phone_number: string
      - email: string
      - address: string
      - birthdate: string (format: YYYY-MM-DD)
      - civil_status: string (options: Single, Married, Widowed, Divorced, Separated)
      - gender: string (options: Male, Female, Not Specified)
      - remarks: string (include any other essential information found on the document that doesn't fit the other fields)

      If a field is not found, return an empty string or null.
      Only return the JSON object, nothing else.
    `;

    const result = await model.generateContent([
      prompt,
      {
        inlineData: {
          data: imageBase64,
          mimeType: image.type,
        },
      },
    ]);

    const response = await result.response;
    const text = response.text();
    
    if (!text) {
      console.error("Gemini returned empty response");
      return NextResponse.json({ error: "AI returned an empty response. Please try again with a clearer image." }, { status: 500 });
    }

    console.log("Gemini Response Text sample:", text.substring(0, 200));
    
    // Extract JSON from the response text (in case Gemini adds markdown formatting)
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    const jsonStr = jsonMatch ? jsonMatch[0] : text;
    
    try {
      const data = JSON.parse(jsonStr);
      return NextResponse.json(data);
    } catch (parseError) {
      console.error("Failed to parse Gemini response. Raw text:", text);
      return NextResponse.json({ 
        error: "AI detected information but the response format was invalid. Please try a different document.",
        details: parseError instanceof Error ? parseError.message : "Parse mismatch"
      }, { status: 500 });
    }
  } catch (error: any) {
    console.error("AI Extraction Critical Error:", error);
    
    // Handle specific AI error types if possible
    let errorMessage = "AI processing failed. ";
    if (error.message?.includes("fetch failed")) {
      errorMessage += "Network timeout or connection issue. Please check your internet.";
    } else if (error.message?.includes("safety")) {
      errorMessage += "The document was flagged by safety filters. Please ensure it is a valid ID or registration document.";
    } else {
      errorMessage += error.message || "Internal Server Error";
    }

    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}

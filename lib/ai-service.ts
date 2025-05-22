import dotenv from "dotenv";
import connectToDatabase from "./db";
import ProjectIdea from "@/models/ProjectIdea";
import { GoogleGenerativeAI } from "@google/generative-ai";

dotenv.config();

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

if (!GEMINI_API_KEY) {
  throw new Error("GEMINI_API_KEY is not set in the environment variables.");
}

const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

type IdeaFormData = {
  areasOfInterest: string;
  domainInterest: string;
  languagesKnown: string;
  additionalInfo?: string;
};

export async function generateProjectIdea(formData: IdeaFormData): Promise<string> {
  const prompt = `
Generate a unique project idea based on the following criteria:

Areas of Interest: ${formData.areasOfInterest}
Domain Interest: ${formData.domainInterest}
Programming Languages: ${formData.languagesKnown}
Additional Information: ${formData.additionalInfo || "None"}

The idea should be innovative, feasible for a student project, and include:
1. A clear title
2. A detailed description
3. Key features
4. Technical implementation details
5. Potential challenges

Format the response in Markdown.
`;

  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const result = await model.generateContent(prompt);
    const responseText = await result.response.text();
    return responseText;
  } catch (error: any) {
    console.error("Error generating idea:", error);
    throw new Error("Failed to generate idea. Please try again later.");
  }
}

export async function checkIdeaUniqueness(
  ideaTitle: string,
  ideaDescription: string
): Promise<{ isUnique: boolean; similarityScore: number }> {
  try {
    await connectToDatabase();

    const existingIdeas = await ProjectIdea.find({ status: "approved" }).select("title description");
    if (existingIdeas.length === 0) return { isUnique: true, similarityScore: 0 };

    const existingIdeasText = existingIdeas
      .map((idea) => `Title: ${idea.title}\nDescription: ${idea.description}`)
      .join("\n\n");

    const prompt = `
I need to determine if a new project idea is sufficiently unique compared to existing ideas.

New idea:
Title: ${ideaTitle}
Description: ${ideaDescription}

Existing ideas:
${existingIdeasText}

Analyze the similarity between the new idea and existing ideas.
First, provide a similarity percentage (0-100) representing how similar the new idea is to the most similar existing idea.
Then, determine if the new idea is sufficiently unique. Consider the core concept, implementation approach, and target domain.

Format your response exactly like this:
Similarity: X%
Unique: yes/no
`;

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const result = await model.generateContent(prompt);
    const text = await result.response.text();

    const similarityMatch = text.match(/Similarity:\s*(\d+)%/i);
    const uniqueMatch = text.match(/Unique:\s*(yes|no)/i);

    const similarityScore = similarityMatch ? parseInt(similarityMatch[1]) : 50;
    const isUnique = uniqueMatch ? uniqueMatch[1].toLowerCase() === "yes" : false;

    return {
      isUnique,
      similarityScore,
    };
  } catch (error: any) {
    console.error("Error checking uniqueness:", error);
    throw new Error("Failed to check uniqueness. Please try again later.");
  }
}

export async function getSimilarityDetails(ideaId: string): Promise<{
  similarityScore: number;
  mostSimilarIdeas: Array<{ id: string; title: string; similarity: number }>;
}> {
  try {
    await connectToDatabase();

    const idea = await ProjectIdea.findById(ideaId).select("title description");
    if (!idea) throw new Error("Idea not found");

    const existingIdeas = await ProjectIdea.find({
      status: "approved",
      _id: { $ne: ideaId },
    }).select("_id title description");

    if (existingIdeas.length === 0) {
      return {
        similarityScore: 0,
        mostSimilarIdeas: [],
      };
    }

    const ideaDetails = `Title: ${idea.title}\nDescription: ${idea.description}`;
    const existingIdeasDetails = existingIdeas.map((i) => ({
      id: i._id.toString(),
      title: i.title,
      details: `Title: ${i.title}\nDescription: ${i.description}`,
    }));

    const prompt = `
I need to calculate similarity percentages between a project idea and several existing ideas.

New idea:
${ideaDetails}

Existing ideas:
${existingIdeasDetails.map((i, idx) => `[${idx + 1}] ${i.details}`).join("\n\n")}

For each existing idea [1] through [${existingIdeasDetails.length}], provide a similarity percentage (0-100)
representing how similar the new idea is to that existing idea.

Format your response exactly like this:
[1]: X%
[2]: Y%
...and so on for each idea.
`;

    const model = genAI.getGenerativeModel({ model: "gemini-pro" });
    const result = await model.generateContent(prompt);
    const text = await result.response.text();

    const similarities: { id: string; title: string; similarity: number }[] = [];

    existingIdeasDetails.forEach((idea, idx) => {
      const match = text.match(new RegExp(`\\[${idx + 1}\\]:\\s*(\\d+)%`, "i"));
      if (match) {
        similarities.push({
          id: idea.id,
          title: idea.title,
          similarity: parseInt(match[1]),
        });
      }
    });

    similarities.sort((a, b) => b.similarity - a.similarity);
    const highestSimilarity = similarities.length > 0 ? similarities[0].similarity : 0;

    return {
      similarityScore: highestSimilarity,
      mostSimilarIdeas: similarities.slice(0, 3),
    };
  } catch (error: any) {
    console.error("Error getting similarity details:", error);
    throw new Error("Failed to get similarity details. Please try again later.");
  }
}

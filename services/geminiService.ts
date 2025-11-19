
import { GoogleGenAI, Type } from "@google/genai";
import { AIProductSuggestion, Product } from "../types";

// Initialize Gemini Client
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const generateProductDetails = async (
  productName: string,
  brand: string,
  characteristics: string
): Promise<AIProductSuggestion | null> => {
  try {
    const prompt = `
      Actúa como un experto en marketing de moda y comercio electrónico.
      Genera una descripción atractiva y persuasiva para un producto, y sugiere la categoría más apropiada.
      
      Producto: ${productName}
      Marca: ${brand}
      Detalles adicionales: ${characteristics}
      
      Categorías permitidas: Camisas, Pantalones, Zapatos, Accesorios, Ropa Deportiva, Vestidos, Chaquetas, Otro.
    `;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            description: {
              type: Type.STRING,
              description: "Una descripción de ventas atractiva para el producto (máximo 300 caracteres).",
            },
            suggestedCategory: {
              type: Type.STRING,
              description: "La categoría que mejor se ajusta al producto de la lista permitida.",
            },
          },
          required: ["description", "suggestedCategory"],
        },
      },
    });

    const jsonText = response.text;
    if (!jsonText) return null;

    const result = JSON.parse(jsonText) as AIProductSuggestion;
    return result;
  } catch (error) {
    console.error("Error generating product details with Gemini:", error);
    return null;
  }
};

export const answerProductQuestion = async (
  product: Product,
  question: string,
  storeName: string
): Promise<string> => {
  const currencySymbol = product.currency === 'NIO' ? 'C$' : '$';
  try {
    const prompt = `
      Eres un asistente de ventas virtual experto y amable para la tienda "${storeName}".
      Un cliente está haciendo una pregunta sobre el siguiente producto:
      
      Nombre: ${product.name}
      Marca: ${product.brand}
      Precio: ${currencySymbol}${product.price}
      Talla: ${product.size}
      Descripción: ${product.description}
      Categoría: ${product.category}
      
      Pregunta del cliente: "${question}"
      
      Responde de manera concisa, útil y orientada a cerrar la venta. Si la pregunta es sobre stock o envíos, inventa una respuesta positiva estándar (ej: envíos a todo el país). Usa un tono amigable y profesional. Máximo 3 oraciones.
    `;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
    });

    return response.text || "Lo siento, no pude procesar tu pregunta en este momento.";
  } catch (error) {
    console.error("Error answering product question:", error);
    return "Hubo un error conectando con el asistente virtual.";
  }
};
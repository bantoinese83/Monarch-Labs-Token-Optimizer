import { GoogleGenAI, Type } from '@google/genai';
import type { ComparisonCode } from '@/types';
import { GEMINI_CONFIG } from '@/constants';
import { GeminiServiceError } from '@/errors/AppError';

const apiKey = process.env.API_KEY || process.env.GEMINI_API_KEY;
if (!apiKey) {
  throw new Error('GEMINI_API_KEY is not set');
}

const ai = new GoogleGenAI({ apiKey });

const responseSchema = {
  type: Type.OBJECT,
  properties: {
    json: {
      type: Type.OBJECT,
      properties: {
        code: {
          type: Type.STRING,
          description: 'The data formatted as a compact JSON string, without newlines.',
        },
      },
      required: ['code'],
    },
    csv: {
      type: Type.OBJECT,
      properties: {
        code: {
          type: Type.STRING,
          description: 'The data formatted as CSV, including a header row.',
        },
      },
      required: ['code'],
    },
    toon: {
      type: Type.OBJECT,
      properties: {
        code: {
          type: Type.STRING,
          description:
            'The data formatted as TOON. Use the example provided as a reference for the TOON format.',
        },
      },
      required: ['code'],
    },
    yaml: {
      type: Type.OBJECT,
      properties: {
        code: { type: Type.STRING, description: 'The data formatted as YAML.' },
      },
      required: ['code'],
    },
  },
  required: ['json', 'csv', 'toon', 'yaml'],
};

export async function getFormatComparisons(inputText: string): Promise<ComparisonCode> {
  // Enhanced prompt to handle any data description
  const prompt = `
You are an expert data format converter. Your task is to interpret ANY data description and generate accurate representations in four formats: JSON, CSV, TOON, and YAML.

Data Description: "${inputText}"

IMPORTANT INSTRUCTIONS:
1. Interpret the description creatively - it can describe:
   - Structured data (objects, arrays, tables)
   - Unstructured data (text, logs, documents)
   - Mixed data types (numbers, strings, booleans, nulls, dates, URLs, emails)
   - Complex nested structures
   - Simple key-value pairs
   - Tabular/row-based data
   - Hierarchical/tree data
   - Any combination of the above

2. If the description is vague or abstract, infer reasonable example data that matches the description.

3. If the description mentions specific values, use them. If it's generic, create realistic sample data.

4. Handle edge cases gracefully:
   - Empty/null values → use null or empty strings appropriately
   - Dates → use ISO 8601 format (YYYY-MM-DD or YYYY-MM-DDTHH:mm:ssZ)
   - Numbers → preserve precision (integers vs decimals)
   - Special characters → escape properly in each format
   - Unicode/emojis → preserve them correctly
   - Very long strings → truncate reasonably if needed
   - Arrays of varying lengths → create representative examples

5. FORMAT REQUIREMENTS:

JSON:
- Compact format (no unnecessary whitespace)
- Valid JSON syntax
- Proper escaping of special characters
- Use appropriate data types (string, number, boolean, null, array, object)

CSV:
- Include header row with column names
- Use commas as delimiters
- Quote fields containing commas, quotes, or newlines
- Each row represents one record
- For nested data, flatten or represent appropriately

TOON (use this exact syntax):
- Key-value pairs with colons
- Arrays use [n] notation where n is the count
- Array items use - [n]: prefix
- Nested structures use indentation
- Example:
  order:
    id: 7
    items[2]:
      - [2]: A12,2
      - [2]: B55,1

YAML:
- Human-readable format
- Proper indentation (2 spaces)
- Use appropriate YAML syntax for lists and maps
- Quote strings when needed

6. Ensure all four formats represent the SAME data, just in different syntaxes.

7. If the description is extremely short or unclear, create a minimal but valid representation.

8. If the description contains actual data/code, parse and convert it appropriately.

Return ONLY a valid JSON object matching this schema:
{
  "json": { "code": "..." },
  "csv": { "code": "..." },
  "toon": { "code": "..." },
  "yaml": { "code": "..." }
}

Do not include any explanations, comments, or markdown formatting in the output.
  `;

  const response = await ai.models.generateContent({
    model: GEMINI_CONFIG.MODEL,
    contents: prompt,
    config: {
      responseMimeType: 'application/json',
      responseSchema: responseSchema,
      temperature: GEMINI_CONFIG.TEMPERATURE,
    },
  });

  try {
    let resultText = response.text?.trim();
    if (!resultText) {
      throw new Error('Empty response from model');
    }

    // Clean up common issues in AI responses
    // Remove markdown code blocks if present
    resultText = resultText.replace(/^```json\s*/i, '').replace(/^```\s*/i, '').replace(/```\s*$/i, '');
    resultText = resultText.trim();

    // Try to extract JSON if wrapped in text
    const jsonMatch = resultText.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      resultText = jsonMatch[0];
    }

    let parsedResult: ComparisonCode;
    try {
      parsedResult = JSON.parse(resultText);
    } catch (parseError) {
      // If parsing fails, try to fix common issues
      console.warn('Initial parse failed, attempting to fix common issues:', parseError);
      
      // Try fixing trailing commas
      resultText = resultText.replace(/,(\s*[}\]])/g, '$1');
      
      // Try fixing unquoted keys
      resultText = resultText.replace(/([{,]\s*)([a-zA-Z_$][a-zA-Z0-9_$]*)\s*:/g, '$1"$2":');
      
      parsedResult = JSON.parse(resultText);
    }

    // Validate that all required formats are present and non-empty
    const requiredFormats: (keyof ComparisonCode)[] = ['json', 'csv', 'toon', 'yaml'];
    for (const format of requiredFormats) {
      if (!parsedResult[format]?.code || parsedResult[format].code.trim().length === 0) {
        throw new Error(`Missing or empty ${format} format in response`);
      }
    }

    return parsedResult;
  } catch (parseError) {
    console.error('Failed to parse Gemini response:', {
      text: response.text,
      error: parseError,
      response: response,
    });
    
    // Provide more helpful error messages
    if (parseError instanceof SyntaxError) {
      throw new GeminiServiceError(
        'The AI response was not in valid JSON format. Please try again with a clearer data description.',
        parseError
      );
    }
    
    throw new GeminiServiceError(
      'Could not parse the response from the model. Please try rephrasing your data description.',
      parseError
    );
  }
}

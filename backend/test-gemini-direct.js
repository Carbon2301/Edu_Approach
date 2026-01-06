import dotenv from 'dotenv';
import fetch from 'node-fetch';

dotenv.config();

const testGeminiDirect = async () => {
  const apiKey = process.env.GEMINI_API_KEY;
  
  if (!apiKey) {
    console.log('❌ GEMINI_API_KEY không có trong .env');
    return;
  }

  console.log('🧪 Testing Gemini API directly...\n');

  const testPrompt = `Bạn là nhà tâm lý giáo dục. Dựa trên kết quả kiểm tra logic 70%, đề xuất 8-10 phương pháp cải thiện chi tiết (mỗi gợi ý 3-4 câu).

🔴Định dạng: Mỗi gợi ý phải là danh sách có số thứ tự, mỗi gợi ý trên 1 dòng riêng:
Ví dụ:
1. [Nội dung gợi ý 1 - 3-4 câu chi tiết]
2. [Nội dung gợi ý 2 - 3-4 câu chi tiết]
3. [Nội dung gợi ý 3 - 3-4 câu chi tiết]
...
BẮT BUỘC phải có 8-10 gợi ý. Mỗi gợi ý phải bắt đầu bằng số thứ tự (1. 2. 3. ...) và nằm trên dòng riêng.`;

  try {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent?key=${apiKey}`;
    
    console.log('📡 Calling API...');
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{ text: testPrompt }]
        }],
        generationConfig: {
          temperature: 0.8,
          maxOutputTokens: 5000,
          topP: 0.9,
          topK: 40,
        }
      }),
    });

    console.log('📊 Response Status:', response.status, response.statusText);
    
    const data = await response.json();
    
    if (!response.ok) {
      console.error('❌ Error:', JSON.stringify(data, null, 2));
      return;
    }

    const aiResponse = data.candidates?.[0]?.content?.parts?.[0]?.text;
    
    if (!aiResponse) {
      console.log('❌ No response text');
      console.log('Full data:', JSON.stringify(data, null, 2));
      return;
    }

    console.log('\n✅ Response received!');
    console.log('📏 Length:', aiResponse.length);
    console.log('\n📝 Full Response:');
    console.log('='.repeat(80));
    console.log(aiResponse);
    console.log('='.repeat(80));
    
    // Test parsing
    console.log('\n🔍 Testing parsing...');
    const lines = aiResponse.split('\n').filter(l => l.trim());
    const numbered = lines.filter(l => /^\d+[\.\)、]\s/.test(l.trim()));
    console.log('   Total lines:', lines.length);
    console.log('   Numbered lines:', numbered.length);
    console.log('   First 3 numbered:', numbered.slice(0, 3).map(l => l.substring(0, 80)));

  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error('Stack:', error.stack);
  }
};

testGeminiDirect();


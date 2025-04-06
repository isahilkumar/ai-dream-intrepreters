document.addEventListener('DOMContentLoaded', function() {
    const dreamForm = document.getElementById('dreamForm');
    const dreamDescription = document.getElementById('dreamDescription');
    const dreamEmotion = document.getElementById('dreamEmotion');
    const dreamRecurring = document.getElementById('dreamRecurring');
    const submitBtn = document.getElementById('submitBtn');
    const loading = document.getElementById('loading');
    const errorMessage = document.getElementById('errorMessage');
    const resultContainer = document.getElementById('resultContainer');
    const resultContent = document.getElementById('resultContent');
    const dreamHistory = document.getElementById('dreamHistory');
    const historyItems = document.getElementById('historyItems');
    
    // API Key - Note: In production, this should be handled server-side
    // Get your API key from OpenAI: https://platform.openai.com/api-keys
    const API_KEY = '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'; // Replace with your actual API key
    
    // Check for existing dream history in local storage
    let dreams = JSON.parse(localStorage.getItem('dreams')) || [];
    
    // Display history if exists
    if (dreams.length > 0) {
        dreamHistory.style.display = 'block';
        renderDreamHistory();
    } 
    
    // Form submission
    dreamForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        // Validate form
        if (!dreamDescription.value.trim() || !dreamEmotion.value) {
            showError('Please fill in all required fields');
            return;
        }
        
        // Show loading, hide other elements
        loading.style.display = 'block';
        errorMessage.style.display = 'none';
        resultContainer.style.display = 'none';
        submitBtn.disabled = true;
        
        try {
            // Prepare the prompt for the AI
            const prompt = `Interpret this dream: "${dreamDescription.value}". 
            The primary emotion was ${dreamEmotion.options[dreamEmotion.selectedIndex].text}. 
            ${dreamRecurring.value === 'yes' ? 'This is a recurring dream.' : ''}
            
            Provide a detailed interpretation including:
            1. Possible meanings of key symbols
            2. Psychological perspective
            3. Cultural/mythological references if relevant
            4. Potential connections to the dreamer's waking life
            5. Suggestions for reflection or action
            
            Format the response in clear paragraphs with a warm, supportive tone.`;
            
            // Call the AI API (using OpenAI as an example)
            const interpretation = await interpretDream(prompt);
            
            // Display the result
            resultContent.innerHTML = formatInterpretation(interpretation);
            resultContainer.style.display = 'block';
            
            // Save to history
            saveDreamToHistory(dreamDescription.value, interpretation);
            
        } catch (error) {
            console.error('Error:', error);
            showError('Failed to interpret dream. Please try again.');
        } finally {
            loading.style.display = 'none';
            submitBtn.disabled = false;
        }
    });
    
    // Function to call the AI API
    async function interpretDream(prompt) {
        // Note: For security, in production you should call your own backend
        // which then calls the OpenAI API with your key
        
        try {
            const response = await fetch('https://api.openai.com/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${API_KEY}`
                },
                body: JSON.stringify({
                    model: "gpt-3.5-turbo",
                    messages: [
                        {
                            role: "system",
                            content: "You are a knowledgeable dream interpreter with expertise in psychology, symbolism, and cultural dream meanings. Provide thoughtful, detailed interpretations that help the dreamer gain insight while being supportive and encouraging."
                        },
                        {
                            role: "user",
                            content: prompt
                        }
                    ],
                    temperature: 0.7
                })
            });
            
            const data = await response.json();
            return data.choices[0].message.content;
        } catch (error) {
            console.error('API Error:', error);
            // Fallback to mock response if API fails
            return getMockResponse();
        }
    }
    
    function getMockResponse() {
        const mockResponses = [
            `Your dream of flying suggests a desire for freedom or escape from current circumstances. The glass city may represent fragility in your life or a sense that things aren't as solid as they appear. 

From a psychological perspective, flying dreams often occur during periods of transition or when you're overcoming limitations. The ${dreamEmotion.options[dreamEmotion.selectedIndex].text} you felt is significant - it indicates your subconscious attitude toward these changes.

In many cultures, flying represents spiritual ascension or higher consciousness. Consider if you're seeking a broader perspective on a situation in your waking life.

Reflect on areas where you might feel constrained. The dream could be encouraging you to rise above challenges or see things from a new angle.`,
            
            `The ${dreamEmotion.options[dreamEmotion.selectedIndex].text} in your dream is a powerful indicator of your current emotional state. Dreams where you experience strong emotions often mirror unresolved feelings in your waking life.

The specific imagery you described suggests ${dreamRecurring.value === 'yes' ? 'an ongoing issue that your mind is processing repeatedly' : 'a recent experience that made a deep impression'}. Your subconscious is working through these emotions symbolically.

Consider keeping a dream journal to track patterns. Many people find that dreams become more understandable when viewed over time rather than in isolation.

If this dream felt particularly vivid or disturbing, it might help to discuss its themes with someone you trust or a professional. Dreams often highlight what we need to pay attention to.`
        ];
        
        return mockResponses[Math.floor(Math.random() * mockResponses.length)];
    }
    
    // Format the interpretation with some basic styling
    function formatInterpretation(text) {
        // Split into paragraphs and add HTML structure
        const paragraphs = text.split('\n\n');
        return paragraphs.map(p => {
            if (p.trim() === '') return '';
            return `<p>${p}</p>`;
        }).join('');
    }
    
    // Show error message
    function showError(message) {
        errorMessage.textContent = message;
        errorMessage.style.display = 'block';
    }
    
    // Save dream to history
    function saveDreamToHistory(description, interpretation) {
        const dream = {
            id: Date.now(),
            date: new Date().toLocaleDateString(),
            description: description,
            interpretation: interpretation
        };
        
        dreams.unshift(dream); // Add to beginning of array
        localStorage.setItem('dreams', JSON.stringify(dreams));
        
        // Update history display
        if (dreams.length > 0) {
            dreamHistory.style.display = 'block';
            renderDreamHistory();
        }
    }
    
    // Render dream history
    function renderDreamHistory() {
        historyItems.innerHTML = dreams.map(dream => `
            <div class="history-item" onclick="showDreamInterpretation(${dream.id})">
                <div class="history-dream">${dream.description.substring(0, 60)}${dream.description.length > 60 ? '...' : ''}</div>
                <div class="history-date">${dream.date}</div>
            </div>
        `).join('');
    }
    
    // Show dream interpretation from history
    window.showDreamInterpretation = function(id) {
        const dream = dreams.find(d => d.id === id);
        if (dream) {
            resultContent.innerHTML = formatInterpretation(dream.interpretation);
            resultContainer.style.display = 'block';
            
            // Scroll to result
            resultContainer.scrollIntoView({ behavior: 'smooth' });
        }
    };
});
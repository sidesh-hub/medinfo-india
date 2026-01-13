import { useState, useRef, useEffect } from 'react';
import { Message } from '@/types/medicine';
import { findMedicine } from '@/data/sampleMedicines';
import ChatHeader from './ChatHeader';
import MessageBubble from './MessageBubble';
import ChatInput from './ChatInput';
import SuggestedQueries from './SuggestedQueries';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Pill } from 'lucide-react';

const generateId = () => Math.random().toString(36).substring(2, 9);

const WELCOME_MESSAGE: Message = {
  id: 'welcome',
  role: 'assistant',
  content: `Hello! 👋 I'm MedInfo, your medicine information assistant for Indian medicines.

I can help you with:
• Medicine details, composition & uses
• Side effects and precautions
• Indian alternatives and pricing
• Availability information

**Note:** I provide information only. For prescriptions or medical advice, please consult a licensed doctor.

How can I help you today?`,
  timestamp: new Date(),
};

const ChatContainer = () => {
  const [messages, setMessages] = useState<Message[]>([WELCOME_MESSAGE]);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const processUserMessage = (userMessage: string) => {
    const lowerMessage = userMessage.toLowerCase();

    // Check for casual conversation
    const casualPatterns = [
      /^(hi|hello|hey|hii+|hola|namaste)/i,
      /^(how are you|how're you|wassup|what's up)/i,
      /^(thanks|thank you|thx)/i,
      /^(bye|goodbye|see you)/i,
    ];

    for (const pattern of casualPatterns) {
      if (pattern.test(lowerMessage)) {
        return {
          content: getCasualResponse(lowerMessage),
          medicineData: undefined,
        };
      }
    }

    // Check for medical advice questions (should redirect to doctor)
    const medicalAdvicePatterns = [
      /should i take/i,
      /can i take.*while.*pregnant/i,
      /can i take.*during.*pregnancy/i,
      /is it safe.*for me/i,
      /what dose.*should/i,
      /how much.*should i take/i,
    ];

    for (const pattern of medicalAdvicePatterns) {
      if (pattern.test(lowerMessage)) {
        return {
          content: `I cannot provide medical prescriptions or personalized dosage advice. This requires a licensed medical professional who can evaluate your specific health condition.

**Please consult a doctor or pharmacist for:**
• Personal dosage recommendations
• Safety during pregnancy/breastfeeding
• Drug interactions with your current medications
• Suitability for your health conditions

Is there any general information about a medicine I can help you with?`,
          medicineData: undefined,
        };
      }
    }

    // Check for fever medicine question
    if (lowerMessage.includes('fever') && (lowerMessage.includes('medicine') || lowerMessage.includes('what') || lowerMessage.includes('which'))) {
      return {
        content: `I cannot prescribe medication. However, I can provide information about medicines commonly used for fever in India.

**Common OTC fever medicines in India:**
• **Paracetamol** (Dolo 650, Crocin, Calpol) - Most commonly used
• **Ibuprofen** (Brufen, Ibugesic) - Also reduces inflammation
• **Combination products** (Crocin Advance, Combiflam)

Would you like detailed information about any of these? Just ask "Tell me about Dolo 650" for example.

⚠️ **Important:** If fever persists beyond 3 days or is very high, please consult a doctor.`,
        medicineData: undefined,
      };
    }

    // Try to find medicine information
    const medicine = findMedicine(userMessage);
    
    if (medicine) {
      return {
        content: `Here's the detailed information for **${medicine.name}**:`,
        medicineData: medicine,
      };
    }

    // No medicine found
    return {
      content: `I couldn't find information about "${userMessage}" in my database. 

**Try searching for:**
• Brand names like "Dolo 650", "Pan D", "Azithromycin"
• Generic names like "Paracetamol", "Omeprazole"

I currently have detailed information on common Indian medicines. More medicines will be added to the database soon!

Is there another medicine you'd like to know about?`,
      medicineData: undefined,
    };
  };

  const getCasualResponse = (message: string): string => {
    if (/^(hi|hello|hey|hii+|hola|namaste)/i.test(message)) {
      return `Hello! 👋 Great to meet you! I'm here to help you with medicine information. What would you like to know about?`;
    }
    if (/^(how are you|how're you|wassup|what's up)/i.test(message)) {
      return `I'm doing great, thank you for asking! 😊 Ready to help you with any medicine-related questions. What can I look up for you today?`;
    }
    if (/^(thanks|thank you|thx)/i.test(message)) {
      return `You're welcome! 🙏 Feel free to ask if you need information about any other medicines. Stay healthy!`;
    }
    if (/^(bye|goodbye|see you)/i.test(message)) {
      return `Goodbye! Take care and stay healthy! 👋 Feel free to come back anytime you need medicine information.`;
    }
    return `I'm here to help! Would you like to know about any medicine?`;
  };

  const handleSendMessage = async (content: string) => {
    // Add user message
    const userMessage: Message = {
      id: generateId(),
      role: 'user',
      content,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, userMessage]);
    setIsLoading(true);

    // Add typing indicator
    const typingMessage: Message = {
      id: 'typing',
      role: 'assistant',
      content: '',
      timestamp: new Date(),
      isTyping: true,
    };
    setMessages((prev) => [...prev, typingMessage]);

    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 1000 + Math.random() * 500));

    // Process and respond
    const response = processUserMessage(content);

    // Remove typing indicator and add response
    const assistantMessage: Message = {
      id: generateId(),
      role: 'assistant',
      content: response.content,
      timestamp: new Date(),
      medicineData: response.medicineData,
    };

    setMessages((prev) => prev.filter((m) => m.id !== 'typing').concat(assistantMessage));

    // If medicine was found, add image verification prompt
    if (response.medicineData) {
      await new Promise((resolve) => setTimeout(resolve, 500));
      const verificationMessage: Message = {
        id: generateId(),
        role: 'assistant',
        content: `📸 **Does the packaging match what you have?** 

If you'd like, you can upload a picture of your medicine strip or box for verification. Just click the image button below!`,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, verificationMessage]);
    }

    setIsLoading(false);
  };

  const handleImageUpload = (file: File) => {
    // Add user message with image indication
    const userMessage: Message = {
      id: generateId(),
      role: 'user',
      content: `[Uploaded image: ${file.name}]`,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, userMessage]);

    // Respond about image verification
    setTimeout(() => {
      const assistantMessage: Message = {
        id: generateId(),
        role: 'assistant',
        content: `Thank you for uploading the image! 🔍

**Image verification** feature is coming soon. This will help you:
• Verify if your medicine matches the description
• Check expiry date visibility
• Confirm authentic packaging

For now, please compare the medicine name, manufacturer, and composition with the information I provided above.

Is there anything else you'd like to know?`,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, assistantMessage]);
    }, 800);
  };

  const hasOnlyWelcome = messages.length === 1;

  return (
    <div className="flex flex-col h-screen bg-background">
      <ChatHeader />

      <ScrollArea className="flex-1">
        <div className="max-w-4xl mx-auto px-3 sm:px-4 py-4 sm:py-6">
          {/* Welcome State */}
          {hasOnlyWelcome && (
            <div className="text-center mb-6 animate-fade-in">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-accent mb-4">
                <Pill className="w-8 h-8 text-primary" />
              </div>
              <h2 className="font-display text-xl sm:text-2xl font-bold text-foreground mb-2">
                Medicine Information Assistant
              </h2>
              <p className="text-sm text-muted-foreground max-w-md mx-auto">
                Get detailed information about medicines available in India. 
                Try asking about any medicine below!
              </p>
            </div>
          )}

          {/* Messages */}
          <div className="space-y-4 sm:space-y-6">
            {messages.map((message) => (
              <MessageBubble key={message.id} message={message} />
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Suggested Queries */}
          {hasOnlyWelcome && (
            <div className="mt-6">
              <SuggestedQueries onSelect={handleSendMessage} />
            </div>
          )}
        </div>
      </ScrollArea>

      <ChatInput
        onSend={handleSendMessage}
        onImageUpload={handleImageUpload}
        isLoading={isLoading}
      />
    </div>
  );
};

export default ChatContainer;

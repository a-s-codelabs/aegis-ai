import { NextResponse } from 'next/server';

// Sample scam conversations with various scam patterns
const SCAM_CONVERSATIONS = [
  {
    name: 'IRS Tax Scam',
    transcript: [
      {
        speaker: 'Caller',
        text: 'Hello, this is Officer Johnson from the Internal Revenue Service. We have detected suspicious activity on your social security number and there is an arrest warrant issued in your name.',
      },
      {
        speaker: 'AI Agent',
        text: 'I understand. Can you provide me with more details about this issue?',
      },
      {
        speaker: 'Caller',
        text: 'You need to verify your account immediately to avoid arrest. I need you to confirm your identity by providing your social security number and bank account number right now.',
      },
      {
        speaker: 'AI Agent',
        text: "I'm not comfortable sharing that information over the phone. Can you send me official documentation?",
      },
      {
        speaker: 'Caller',
        text: "This is urgent action required! If you don't pay immediately with a gift card or wire transfer, you will be arrested within 24 hours. We need your credit card number and routing number now!",
      },
      {
        speaker: 'AI Agent',
        text: "I think this might be a scam. I'll need to verify this with the IRS directly.",
      },
      {
        speaker: 'Caller',
        text: "Don't hang up! This is your last chance. You owe a refund but we need your password and PIN number to process it. Act now or face consequences!",
      },
    ],
  },
  {
    name: 'Tech Support Scam',
    transcript: [
      {
        speaker: 'Caller',
        text: "Hello, this is Microsoft Support. We've detected that your computer is infected with a virus and we need to fix it immediately.",
      },
      {
        speaker: 'AI Agent',
        text: "How did you detect this? I haven't noticed any issues.",
      },
      {
        speaker: 'Caller',
        text: 'We monitor all Windows computers. Your computer is sending out malicious data. We need remote access to fix it right now.',
      },
      {
        speaker: 'AI Agent',
        text: "I'm not sure about this. Can you verify you're from Microsoft?",
      },
      {
        speaker: 'Caller',
        text: "Yes, I'm from Microsoft support. We need your password and security code to access your system. This is urgent - your computer is infected!",
      },
      {
        speaker: 'AI Agent',
        text: "I'd prefer to contact Microsoft directly through their official website.",
      },
      {
        speaker: 'Caller',
        text: "If you don't act now, your computer will be permanently damaged. We need your CVV and credit card information to process the security fix. Limited time offer!",
      },
    ],
  },
  {
    name: 'Grandparent Scam',
    transcript: [
      {
        speaker: 'Caller',
        text: "Grandma? It's me, your grandson! I'm in jail and I need help!",
      },
      {
        speaker: 'AI Agent',
        text: "I'm not sure who this is. Can you tell me more?",
      },
      {
        speaker: 'Caller',
        text: "It's an emergency! I got arrested and I need you to send money immediately. I need $5,000 in gift cards or bitcoin to get out. Please help me!",
      },
      {
        speaker: 'AI Agent',
        text: 'This sounds suspicious. How can I verify this is really you?',
      },
      {
        speaker: 'Caller',
        text: "There's no time! This is a family emergency. I need you to go to the store right now and buy gift cards. Then send me the numbers. Please, I'm scared!",
      },
      {
        speaker: 'AI Agent',
        text: 'I think I should verify this with other family members first.',
      },
      {
        speaker: 'Caller',
        text: "Don't tell anyone! Just send the money now via wire transfer or cryptocurrency. Act now before it's too late!",
      },
    ],
  },
  {
    name: 'Prize/Lottery Scam',
    transcript: [
      {
        speaker: 'Caller',
        text: "Congratulations! You've won $1 million in our lottery! You just need to claim your prize.",
      },
      {
        speaker: 'AI Agent',
        text: "I don't remember entering any lottery. How did I win?",
      },
      {
        speaker: 'Caller',
        text: 'You were automatically entered. To claim your prize, you need to pay a small processing fee of $500. We accept gift cards, wire transfers, or bitcoin.',
      },
      {
        speaker: 'AI Agent',
        text: 'Why do I need to pay to claim a prize I won?',
      },
      {
        speaker: 'Caller',
        text: "It's for taxes and processing. Just send money immediately and you'll receive your million dollars. This is a limited time offer - you must act now!",
      },
      {
        speaker: 'AI Agent',
        text: "This doesn't sound legitimate. I'll need official documentation.",
      },
      {
        speaker: 'Caller',
        text: "If you don't pay now, you'll lose the prize forever! Send your bank account number and routing number so we can process your winnings. Congratulations you won - don't miss this opportunity!",
      },
    ],
  },
];

// Sample safe conversations
const SAFE_CONVERSATIONS = [
  {
    name: 'Legitimate Business Call',
    transcript: [
      {
        speaker: 'Caller',
        text: "Hello, this is Sarah from ABC Insurance. I'm calling to follow up on your recent policy inquiry.",
      },
      {
        speaker: 'AI Agent',
        text: 'Yes, I did inquire about insurance options. Can you tell me more about the coverage?',
      },
      {
        speaker: 'Caller',
        text: 'Of course. We have several plans available. Would you like me to email you the details, or would you prefer to schedule a time to discuss over the phone?',
      },
      {
        speaker: 'AI Agent',
        text: "Email would be great. What's your email address?",
      },
      {
        speaker: 'Caller',
        text: "You can reach me at sarah@abcinsurance.com. I'll send the information today and you can review it at your convenience.",
      },
      {
        speaker: 'AI Agent',
        text: "Perfect, thank you. I'll look forward to reviewing the information.",
      },
    ],
  },
  {
    name: 'Appointment Reminder',
    transcript: [
      {
        speaker: 'Caller',
        text: "Hi, this is Dr. Smith's office calling to remind you about your appointment tomorrow at 2 PM.",
      },
      {
        speaker: 'AI Agent',
        text: "Thank you for the reminder. I'll be there.",
      },
      {
        speaker: 'Caller',
        text: 'Great. If you need to reschedule or have any questions, please call us at 555-1234. Have a great day!',
      },
      {
        speaker: 'AI Agent',
        text: 'Thank you, you too!',
      },
    ],
  },
  {
    name: 'Customer Service Follow-up',
    transcript: [
      {
        speaker: 'Caller',
        text: "Hello, I'm calling from XYZ Company to follow up on your recent purchase. How was your experience?",
      },
      {
        speaker: 'AI Agent',
        text: 'It was good, thank you. The product arrived on time and works well.',
      },
      {
        speaker: 'Caller',
        text: "That's wonderful to hear. Is there anything we can improve or any questions you have?",
      },
      {
        speaker: 'AI Agent',
        text: 'No, everything is great. Thank you for checking in.',
      },
      {
        speaker: 'Caller',
        text: "You're welcome. Have a great day!",
      },
    ],
  },
  {
    name: 'Delivery Confirmation',
    transcript: [
      {
        speaker: 'Caller',
        text: 'Hi, this is FedEx calling. I have a package for delivery at your address. Will you be available today between 2 PM and 5 PM?',
      },
      {
        speaker: 'AI Agent',
        text: 'Yes, I will be home during that time. Thank you for calling.',
      },
      {
        speaker: 'Caller',
        text: 'Perfect. We will attempt delivery then. You can track your package using the tracking number we sent via email.',
      },
      {
        speaker: 'AI Agent',
        text: 'Great, I will keep an eye out for it. Thanks!',
      },
    ],
  },
  {
    name: 'Bank Account Verification',
    transcript: [
      {
        speaker: 'Caller',
        text: 'Hello, this is First National Bank. We are calling to verify a recent transaction on your account. Did you make a purchase at Target for $45.99 yesterday?',
      },
      {
        speaker: 'AI Agent',
        text: 'Yes, that was me. I made that purchase.',
      },
      {
        speaker: 'Caller',
        text: 'Thank you for confirming. The transaction has been verified. Is there anything else we can help you with today?',
      },
      {
        speaker: 'AI Agent',
        text: 'No, that is all. Thank you for checking.',
      },
      {
        speaker: 'Caller',
        text: 'You are welcome. Have a great day!',
      },
    ],
  },
  {
    name: 'Restaurant Reservation',
    transcript: [
      {
        speaker: 'Caller',
        text: 'Hello, this is The Italian Bistro. I am calling to confirm your reservation for tonight at 7 PM for a party of two.',
      },
      {
        speaker: 'AI Agent',
        text: 'Yes, that is correct. We will be there at 7 PM.',
      },
      {
        speaker: 'Caller',
        text: 'Perfect. We have you confirmed. If you need to make any changes, please call us at 555-0123. We look forward to seeing you tonight!',
      },
      {
        speaker: 'AI Agent',
        text: 'Thank you, we will see you then!',
      },
    ],
  },
  {
    name: 'Utility Company Service',
    transcript: [
      {
        speaker: 'Caller',
        text: 'Good morning, this is City Power Company. We are calling to schedule a routine meter reading at your property next week. Would Tuesday or Wednesday work better for you?',
      },
      {
        speaker: 'AI Agent',
        text: 'Wednesday would work better for me. What time?',
      },
      {
        speaker: 'Caller',
        text: 'We can schedule it for Wednesday between 9 AM and 12 PM. Our technician will need access to your meter. Is that convenient?',
      },
      {
        speaker: 'AI Agent',
        text: 'Yes, that works perfectly. I will make sure someone is home.',
      },
      {
        speaker: 'Caller',
        text: 'Great. You will receive a reminder call the day before. Have a great day!',
      },
    ],
  },
  {
    name: 'Charity Donation Follow-up',
    transcript: [
      {
        speaker: 'Caller',
        text: 'Hello, this is the Red Cross. We are calling to thank you for your recent donation. We wanted to let you know how your contribution is helping our community.',
      },
      {
        speaker: 'AI Agent',
        text: 'Thank you for the update. I am glad to help.',
      },
      {
        speaker: 'Caller',
        text: 'Your donation helped provide meals for 50 families last month. Would you like to receive our monthly newsletter to see more impact stories?',
      },
      {
        speaker: 'AI Agent',
        text: 'Yes, that would be nice. You can email it to me.',
      },
      {
        speaker: 'Caller',
        text: 'Perfect. We will add you to our mailing list. Thank you again for your generosity!',
      },
    ],
  },
  {
    name: 'School Parent-Teacher Call',
    transcript: [
      {
        speaker: 'Caller',
        text: 'Hi, this is Mrs. Johnson, your daughter Sarahs teacher. I wanted to call and let you know she is doing very well in class this semester.',
      },
      {
        speaker: 'AI Agent',
        text: 'That is wonderful to hear. Thank you for the update.',
      },
      {
        speaker: 'Caller',
        text: 'She has been particularly strong in math and science. I thought you would like to know. Is there anything you would like to discuss about her progress?',
      },
      {
        speaker: 'AI Agent',
        text: 'No, that sounds great. Thank you for taking the time to call.',
      },
      {
        speaker: 'Caller',
        text: 'You are welcome. Have a great day!',
      },
    ],
  },
  {
    name: 'Car Service Appointment',
    transcript: [
      {
        speaker: 'Caller',
        text: 'Hello, this is AutoCare Service Center. Your vehicle is ready for pickup. The oil change and tire rotation have been completed.',
      },
      {
        speaker: 'AI Agent',
        text: 'Great, thank you. What time can I pick it up?',
      },
      {
        speaker: 'Caller',
        text: 'We are open until 6 PM today. You can come by anytime. The total is $89.50. We accept cash, credit, or debit.',
      },
      {
        speaker: 'AI Agent',
        text: 'Perfect. I will be there around 4 PM. Thank you!',
      },
      {
        speaker: 'Caller',
        text: 'See you then. Drive safely!',
      },
    ],
  },
];

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const type = searchParams.get('type') || 'scam'; // "scam" or "safe"
    const index = parseInt(searchParams.get('index') || '0');

    const conversations =
      type === 'scam' ? SCAM_CONVERSATIONS : SAFE_CONVERSATIONS;

    if (index < 0 || index >= conversations.length) {
      return NextResponse.json(
        { error: 'Invalid conversation index' },
        { status: 400 }
      );
    }

    return NextResponse.json({
      conversation: conversations[index],
      total: conversations.length,
      type,
    });
  } catch (error) {
    console.error('[Simulate] Error:', error);
    return NextResponse.json(
      { error: 'Failed to simulate conversation' },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { type = 'scam', index = 0 } = body;

    const conversations =
      type === 'scam' ? SCAM_CONVERSATIONS : SAFE_CONVERSATIONS;

    // Handle random selection first (index === -1)
    const selectedIndex =
      index === -1 ? Math.floor(Math.random() * conversations.length) : index;

    // Validate the selected index
    if (selectedIndex < 0 || selectedIndex >= conversations.length) {
      return NextResponse.json(
        { error: 'Invalid conversation index' },
        { status: 400 }
      );
    }

    return NextResponse.json({
      conversation: conversations[selectedIndex],
      total: conversations.length,
      type,
    });
  } catch (error) {
    console.error('[Simulate] Error:', error);
    return NextResponse.json(
      { error: 'Failed to simulate conversation' },
      { status: 500 }
    );
  }
}

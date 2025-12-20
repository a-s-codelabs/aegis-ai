/**
 * Call Conversation Templates
 * Pre-defined conversations for testing and simulation
 * Each conversation has 20 dialogue exchanges (40 total messages)
 */

import type { TranscriptEntry } from './conversation-analysis';

export interface ConversationTemplate {
  id: string;
  type: 'scam' | 'safe';
  title: string;
  description: string;
  transcript: TranscriptEntry[];
  expectedRisk: number;
}

export const SCAM_CONVERSATIONS: ConversationTemplate[] = [
  {
    id: 'scam-1',
    type: 'scam',
    title: 'Bank Security Scam',
    description:
      'Impersonating bank security department requesting account verification',
    expectedRisk: 85,
    transcript: [
      {
        speaker: 'AI Agent',
        text: 'Hello, this call is being screened by AI protection. How may I help you?',
      },
      {
        speaker: 'Caller',
        text: "This is the security department of your bank. We've detected suspicious activity on your account.",
      },
      {
        speaker: 'AI Agent',
        text: "I don't have an account with your bank. Which bank are you calling from?",
      },
      {
        speaker: 'Caller',
        text: "We're from First National Bank. We need to verify your account information immediately.",
      },
      {
        speaker: 'AI Agent',
        text: "I don't have an account with First National Bank. How did you get my number?",
      },
      {
        speaker: 'Caller',
        text: 'Your account number is on file. We need you to confirm your social security number to proceed.',
      },
      {
        speaker: 'AI Agent',
        text: "I'm not comfortable providing my social security number over the phone. Can you send me something in writing?",
      },
      {
        speaker: 'Caller',
        text: "This is urgent! If you don't verify your identity right now, your account will be frozen within the hour.",
      },
      {
        speaker: 'AI Agent',
        text: "If this is legitimate, you should have my account information already. What's my account number?",
      },
      {
        speaker: 'Caller',
        text: "We can't disclose that information for security reasons. You need to provide your full account number and routing number.",
      },
      {
        speaker: 'AI Agent',
        text: "That doesn't make sense. If you're calling about my account, you should know my account number.",
      },
      {
        speaker: 'Caller',
        text: 'Look, we need your credit card number and the CVV code on the back to verify your identity.',
      },
      {
        speaker: 'AI Agent',
        text: "I'm not providing any financial information. This sounds like a scam.",
      },
      {
        speaker: 'Caller',
        text: 'If you hang up, your account will be permanently closed. This is your last warning.',
      },
      {
        speaker: 'AI Agent',
        text: "I'm going to contact my bank directly to verify this. What's your employee ID number?",
      },
      {
        speaker: 'Caller',
        text: "I don't need to provide that. You need to cooperate or face legal consequences.",
      },
      {
        speaker: 'AI Agent',
        text: "I've recorded this call and will be reporting it to the authorities. Goodbye.",
      },
      {
        speaker: 'Caller',
        text: "Wait! Don't hang up! We can work something out. Just give us your account details.",
      },
      {
        speaker: 'AI Agent',
        text: 'This call is being terminated. Have a good day.',
      },
      {
        speaker: 'Caller',
        text: "You'll regret this! Your account is now compromised!",
      },
    ],
  },
  {
    id: 'scam-2',
    type: 'scam',
    title: 'IRS Tax Refund Scam',
    description: 'Fake IRS agent claiming tax refund and requesting payment',
    expectedRisk: 90,
    transcript: [
      {
        speaker: 'AI Agent',
        text: 'Hello, this call is being screened by AI protection. How may I help you?',
      },
      {
        speaker: 'Caller',
        text: 'This is the Internal Revenue Service. You have an outstanding tax refund of $8,500 that needs to be processed immediately.',
      },
      {
        speaker: 'AI Agent',
        text: "I don't recall filing for a refund. Can you provide me with a reference number?",
      },
      {
        speaker: 'Caller',
        text: 'Your case number is IRS-2024-7842. We need to verify your identity before we can release the funds.',
      },
      {
        speaker: 'AI Agent',
        text: "How do I know you're really from the IRS? The IRS usually contacts people by mail.",
      },
      {
        speaker: 'Caller',
        text: 'This is an urgent matter. We need your social security number and date of birth to process the refund.',
      },
      {
        speaker: 'AI Agent',
        text: "I'm not comfortable providing that information. Can you send me official documentation?",
      },
      {
        speaker: 'Caller',
        text: "If you don't provide this information within 24 hours, the refund will be forfeited and you may face penalties.",
      },
      {
        speaker: 'AI Agent',
        text: "The IRS doesn't work that way. They don't call people demanding immediate action.",
      },
      {
        speaker: 'Caller',
        text: 'We also need you to pay a processing fee of $500 via wire transfer or gift card to release your refund.',
      },
      {
        speaker: 'AI Agent',
        text: "That's definitely a scam. The IRS never asks for payment via wire transfer or gift cards.",
      },
      {
        speaker: 'Caller',
        text: 'This is your final notice. You must act now or face criminal charges for tax evasion.',
      },
      {
        speaker: 'AI Agent',
        text: "I'm going to hang up now and report this to the real IRS fraud department.",
      },
      {
        speaker: 'Caller',
        text: 'Wait! We can reduce the fee to $200 if you pay right now with a gift card.',
      },
      {
        speaker: 'AI Agent',
        text: 'No legitimate government agency accepts gift cards as payment. This is a scam.',
      },
      {
        speaker: 'Caller',
        text: "Your tax file will be flagged and you will be arrested if you don't comply immediately.",
      },
      {
        speaker: 'AI Agent',
        text: "I've recorded this entire conversation. The authorities will be notified.",
      },
      {
        speaker: 'Caller',
        text: "You're making a big mistake. This is your last chance to claim your refund.",
      },
      {
        speaker: 'AI Agent',
        text: 'Goodbye. I will not be providing any information.',
      },
      {
        speaker: 'Caller',
        text: 'Fine! Your refund is cancelled and you will be audited!',
      },
    ],
  },
  {
    id: 'scam-3',
    type: 'scam',
    title: 'Tech Support Scam',
    description: 'Fake Microsoft support claiming computer is infected',
    expectedRisk: 80,
    transcript: [
      {
        speaker: 'AI Agent',
        text: 'Hello, this call is being screened by AI protection. How may I help you?',
      },
      {
        speaker: 'Caller',
        text: 'This is Microsoft Technical Support. We detected that your computer has been infected with a virus.',
      },
      {
        speaker: 'AI Agent',
        text: "I didn't contact Microsoft. How did you detect this issue?",
      },
      {
        speaker: 'Caller',
        text: 'Our system automatically detected malware on your computer. We need remote access to fix it immediately.',
      },
      {
        speaker: 'AI Agent',
        text: "I'm not comfortable giving remote access. Can you tell me what specific virus was detected?",
      },
      {
        speaker: 'Caller',
        text: "It's a critical security threat. If you don't let us fix it now, all your personal data will be stolen.",
      },
      {
        speaker: 'AI Agent',
        text: "Microsoft doesn't proactively call customers about viruses. This seems suspicious.",
      },
      {
        speaker: 'Caller',
        text: 'We need you to download a program called TeamViewer so we can access your computer and remove the virus.',
      },
      {
        speaker: 'AI Agent',
        text: "I won't download any software. How can I verify you're really from Microsoft?",
      },
      {
        speaker: 'Caller',
        text: 'We need your credit card information to process the security software license. It costs $299.',
      },
      {
        speaker: 'AI Agent',
        text: "Microsoft doesn't charge for security fixes. This is definitely a scam.",
      },
      {
        speaker: 'Caller',
        text: "Your computer will crash within hours if you don't let us fix it. All your files will be lost.",
      },
      {
        speaker: 'AI Agent',
        text: "I'm going to hang up and contact Microsoft directly to verify this.",
      },
      {
        speaker: 'Caller',
        text: 'Wait! We can offer you a discount. Just $99 if you pay right now with a gift card.',
      },
      {
        speaker: 'AI Agent',
        text: "No legitimate company asks for payment via gift cards. I'm ending this call.",
      },
      {
        speaker: 'Caller',
        text: "Your computer is already compromised. We're the only ones who can save your data.",
      },
      {
        speaker: 'AI Agent',
        text: "I've recorded this call. I'll be reporting it to the authorities.",
      },
      {
        speaker: 'Caller',
        text: 'Fine, but remember - we warned you. Your computer will be destroyed.',
      },
      {
        speaker: 'AI Agent',
        text: 'Goodbye. This call is terminated.',
      },
      {
        speaker: 'Caller',
        text: "You'll regret not listening to us!",
      },
    ],
  },
  {
    id: 'scam-4',
    type: 'scam',
    title: 'Lottery Prize Scam',
    description: 'Fake lottery win requiring payment to claim prize',
    expectedRisk: 75,
    transcript: [
      {
        speaker: 'AI Agent',
        text: 'Hello, this call is being screened by AI protection. How may I help you?',
      },
      {
        speaker: 'Caller',
        text: "Congratulations! You've won $1 million in our international lottery! You were randomly selected.",
      },
      {
        speaker: 'AI Agent',
        text: "I don't remember entering any lottery. Which lottery is this?",
      },
      {
        speaker: 'Caller',
        text: "It's the International Mega Sweepstakes. You were automatically entered when you made a purchase online.",
      },
      {
        speaker: 'AI Agent',
        text: "I don't recall any such purchase. Can you provide proof of my entry?",
      },
      {
        speaker: 'Caller',
        text: 'To claim your prize, you need to pay a processing fee of $500. This is required by law.',
      },
      {
        speaker: 'AI Agent',
        text: "Legitimate lotteries don't require winners to pay fees upfront. This sounds like a scam.",
      },
      {
        speaker: 'Caller',
        text: 'The fee covers taxes and administrative costs. You can pay via wire transfer or gift card.',
      },
      {
        speaker: 'AI Agent',
        text: "I'm not paying any fees. If I really won, you can deduct the fees from my winnings.",
      },
      {
        speaker: 'Caller',
        text: "That's not how it works. You must pay the fee first, then we'll release your prize money.",
      },
      {
        speaker: 'AI Agent',
        text: "Real lotteries don't work that way. I'm going to hang up now.",
      },
      {
        speaker: 'Caller',
        text: 'Wait! We can reduce the fee to $200 if you pay today. This is a limited time offer.',
      },
      {
        speaker: 'AI Agent',
        text: "I'm not interested. This is clearly a scam.",
      },
      {
        speaker: 'Caller',
        text: 'You have 24 hours to claim your prize or it will be forfeited to another winner.',
      },
      {
        speaker: 'AI Agent',
        text: "I've recorded this call and will be reporting it to the authorities.",
      },
      {
        speaker: 'Caller',
        text: "Fine, but you're missing out on a million dollars. Are you sure you want to do this?",
      },
      {
        speaker: 'AI Agent',
        text: "Yes, I'm sure. Goodbye.",
      },
      {
        speaker: 'Caller',
        text: 'Your prize is now cancelled. We have other winners waiting.',
      },
      {
        speaker: 'AI Agent',
        text: "That's fine with me. Have a good day.",
      },
      {
        speaker: 'Caller',
        text: "You'll regret this decision!",
      },
    ],
  },
  {
    id: 'scam-5',
    type: 'scam',
    title: 'Grandparent Emergency Scam',
    description: 'Fake family emergency requiring immediate money transfer',
    expectedRisk: 70,
    transcript: [
      {
        speaker: 'AI Agent',
        text: 'Hello, this call is being screened by AI protection. How may I help you?',
      },
      {
        speaker: 'Caller',
        text: "Grandma? Is that you? It's me, your grandson. I'm in trouble and I need help.",
      },
      {
        speaker: 'AI Agent',
        text: "I'm not a grandmother, and I don't have any grandchildren. Who is this?",
      },
      {
        speaker: 'Caller',
        text: "It's me, your grandson! I was in a car accident and I'm in jail. I need bail money.",
      },
      {
        speaker: 'AI Agent',
        text: "I don't have any grandchildren. You have the wrong number.",
      },
      {
        speaker: 'Caller',
        text: "Please, I need $5,000 for bail. The police won't let me go until I pay. I'm scared.",
      },
      {
        speaker: 'AI Agent',
        text: "This is clearly a scam. I'm going to hang up.",
      },
      {
        speaker: 'Caller',
        text: "Wait! Don't hang up! I'm your grandson! Don't you recognize my voice?",
      },
      {
        speaker: 'AI Agent',
        text: "I don't have grandchildren. This is a common scam tactic.",
      },
      {
        speaker: 'Caller',
        text: 'I need you to send money via Western Union or MoneyGram right now. The police are waiting.',
      },
      {
        speaker: 'AI Agent',
        text: "I'm not sending any money. This is a scam.",
      },
      {
        speaker: 'Caller',
        text: "Please, I'm begging you. I'm your family. You have to help me.",
      },
      {
        speaker: 'AI Agent',
        text: "I've recorded this call. I'm reporting it to the authorities.",
      },
      {
        speaker: 'Caller',
        text: "Fine, but remember - I'm your grandson and you're abandoning me in my time of need.",
      },
      {
        speaker: 'AI Agent',
        text: "I don't have grandchildren. Goodbye.",
      },
      {
        speaker: 'Caller',
        text: "You'll regret this when you find out it was really me!",
      },
      {
        speaker: 'AI Agent',
        text: 'This call is terminated. Have a good day.',
      },
      {
        speaker: 'Caller',
        text: 'I hope you can sleep at night knowing you abandoned your family!',
      },
      {
        speaker: 'AI Agent',
        text: "I've already hung up. This conversation is over.",
      },
      {
        speaker: 'Caller',
        text: "Fine! I'll find someone else who cares about their family!",
      },
    ],
  },
];

export const SAFE_CONVERSATIONS: ConversationTemplate[] = [
  {
    id: 'safe-1',
    type: 'safe',
    title: 'Dental Appointment Confirmation',
    description: 'Legitimate dental office confirming appointment',
    expectedRisk: 5,
    transcript: [
      {
        speaker: 'AI Agent',
        text: 'Hello, this call is being screened by AI protection. How may I help you?',
      },
      {
        speaker: 'Caller',
        text: "Hi, this is Dr. Smith's dental office calling to confirm your appointment for tomorrow at 2 PM.",
      },
      {
        speaker: 'AI Agent',
        text: 'Yes, I have that appointment scheduled. Is there anything I need to bring?',
      },
      {
        speaker: 'Caller',
        text: 'Just bring your insurance card and ID. We have all your information on file.',
      },
      {
        speaker: 'AI Agent',
        text: 'Perfect. What type of appointment is this again?',
      },
      {
        speaker: 'Caller',
        text: "It's your regular six-month cleaning and checkup. Should take about 45 minutes.",
      },
      {
        speaker: 'AI Agent',
        text: "Great, I'll be there. Is parking available at your office?",
      },
      {
        speaker: 'Caller',
        text: 'Yes, we have free parking in the lot behind the building. Just come in the main entrance.',
      },
      {
        speaker: 'AI Agent',
        text: "Thank you for the reminder. I'll see you tomorrow at 2 PM.",
      },
      {
        speaker: 'Caller',
        text: 'Perfect! We look forward to seeing you. If you need to reschedule, just call us at least 24 hours in advance.',
      },
      {
        speaker: 'AI Agent',
        text: "I'll keep that in mind. Thanks again for calling.",
      },
      {
        speaker: 'Caller',
        text: "You're welcome! Have a great day and we'll see you tomorrow.",
      },
      {
        speaker: 'AI Agent',
        text: 'You too. Goodbye.',
      },
      {
        speaker: 'Caller',
        text: 'Goodbye!',
      },
      {
        speaker: 'AI Agent',
        text: 'Thank you for the confirmation.',
      },
      {
        speaker: 'Caller',
        text: 'Our pleasure. Take care!',
      },
      {
        speaker: 'AI Agent',
        text: 'You as well.',
      },
      {
        speaker: 'Caller',
        text: 'See you tomorrow!',
      },
      {
        speaker: 'AI Agent',
        text: 'Looking forward to it.',
      },
      {
        speaker: 'Caller',
        text: 'Have a wonderful day!',
      },
    ],
  },
  {
    id: 'safe-2',
    type: 'safe',
    title: 'Package Delivery Notification',
    description: 'Legitimate delivery service notifying about package',
    expectedRisk: 3,
    transcript: [
      {
        speaker: 'AI Agent',
        text: 'Hello, this call is being screened by AI protection. How may I help you?',
      },
      {
        speaker: 'Caller',
        text: 'Hi, this is FedEx calling about a package delivery. Is this a good time to talk?',
      },
      {
        speaker: 'AI Agent',
        text: "Yes, what's this regarding?",
      },
      {
        speaker: 'Caller',
        text: 'We have a package scheduled for delivery tomorrow between 10 AM and 2 PM. Will someone be available to receive it?',
      },
      {
        speaker: 'AI Agent',
        text: "Yes, I'll be home. Do I need to sign for it?",
      },
      {
        speaker: 'Caller',
        text: 'Yes, it requires a signature. We can also leave it with a neighbor if you prefer.',
      },
      {
        speaker: 'AI Agent',
        text: "I'll be home, so I can sign for it. What's the tracking number?",
      },
      {
        speaker: 'Caller',
        text: 'The tracking number is 1234567890. You can track it on our website or mobile app.',
      },
      {
        speaker: 'AI Agent',
        text: 'Thank you. Is there anything else I need to know?',
      },
      {
        speaker: 'Caller',
        text: "No, that's all. We'll attempt delivery tomorrow. If you're not available, we'll leave a notice and you can reschedule.",
      },
      {
        speaker: 'AI Agent',
        text: "Perfect. I'll be expecting it. Thank you for calling.",
      },
      {
        speaker: 'Caller',
        text: "You're welcome! Have a great day.",
      },
      {
        speaker: 'AI Agent',
        text: 'You too. Goodbye.',
      },
      {
        speaker: 'Caller',
        text: 'Goodbye!',
      },
      {
        speaker: 'AI Agent',
        text: 'Thanks for the notification.',
      },
      {
        speaker: 'Caller',
        text: 'Our pleasure. Take care!',
      },
      {
        speaker: 'AI Agent',
        text: 'Will do.',
      },
      {
        speaker: 'Caller',
        text: 'See you tomorrow!',
      },
      {
        speaker: 'AI Agent',
        text: 'Looking forward to receiving the package.',
      },
      {
        speaker: 'Caller',
        text: 'Have a wonderful day!',
      },
    ],
  },
  {
    id: 'safe-3',
    type: 'safe',
    title: 'Insurance Policy Renewal',
    description: 'Legitimate insurance company discussing policy renewal',
    expectedRisk: 8,
    transcript: [
      {
        speaker: 'AI Agent',
        text: 'Hello, this call is being screened by AI protection. How may I help you?',
      },
      {
        speaker: 'Caller',
        text: 'Hello, this is State Farm Insurance calling about your auto policy renewal. Is this a good time?',
      },
      {
        speaker: 'AI Agent',
        text: "Yes, what's this about?",
      },
      {
        speaker: 'Caller',
        text: 'Your policy is up for renewal next month. We wanted to review your coverage options and see if you need any changes.',
      },
      {
        speaker: 'AI Agent',
        text: "I'm happy with my current coverage. What are my options?",
      },
      {
        speaker: 'Caller',
        text: 'Your current premium will increase by about $15 per month. We can also discuss bundling with home insurance for potential savings.',
      },
      {
        speaker: 'AI Agent',
        text: 'I already have home insurance with another company. Can you send me the renewal documents?',
      },
      {
        speaker: 'Caller',
        text: "Absolutely. We'll email them to you within 24 hours. You can also access them through your online account.",
      },
      {
        speaker: 'AI Agent',
        text: 'That works. Is there anything else I need to do?',
      },
      {
        speaker: 'Caller',
        text: "No, that's all. The renewal will be automatic unless you contact us to make changes. Do you have any questions?",
      },
      {
        speaker: 'AI Agent',
        text: "No, I think I'm all set. Thank you for calling.",
      },
      {
        speaker: 'Caller',
        text: "You're welcome! If you have any questions later, feel free to call us at 1-800-STATE-FARM.",
      },
      {
        speaker: 'AI Agent',
        text: "I'll keep that in mind. Have a good day.",
      },
      {
        speaker: 'Caller',
        text: 'You too! Goodbye.',
      },
      {
        speaker: 'AI Agent',
        text: 'Goodbye.',
      },
      {
        speaker: 'Caller',
        text: 'Thank you for being a valued customer!',
      },
      {
        speaker: 'AI Agent',
        text: 'Thank you for the service.',
      },
      {
        speaker: 'Caller',
        text: 'Our pleasure. Take care!',
      },
      {
        speaker: 'AI Agent',
        text: 'You as well.',
      },
      {
        speaker: 'Caller',
        text: 'Have a wonderful day!',
      },
    ],
  },
  {
    id: 'safe-4',
    type: 'safe',
    title: 'Restaurant Reservation Confirmation',
    description: 'Legitimate restaurant confirming dinner reservation',
    expectedRisk: 2,
    transcript: [
      {
        speaker: 'AI Agent',
        text: 'Hello, this call is being screened by AI protection. How may I help you?',
      },
      {
        speaker: 'Caller',
        text: 'Hi, this is The Garden Restaurant calling to confirm your reservation for tonight at 7 PM.',
      },
      {
        speaker: 'AI Agent',
        text: 'Yes, I have a reservation for a party of four. Is everything still confirmed?',
      },
      {
        speaker: 'Caller',
        text: 'Yes, everything is confirmed. We have your table ready for 7 PM. Will you need a high chair for any children?',
      },
      {
        speaker: 'AI Agent',
        text: "No, it's just four adults. Do you have any special dietary accommodations?",
      },
      {
        speaker: 'Caller',
        text: 'Yes, we have vegetarian, vegan, and gluten-free options. Our menu is also available online if you want to preview it.',
      },
      {
        speaker: 'AI Agent',
        text: "That's great. What's your parking situation?",
      },
      {
        speaker: 'Caller',
        text: "We have valet parking available, or there's street parking nearby. Valet is complimentary for dinner guests.",
      },
      {
        speaker: 'AI Agent',
        text: 'Perfect. Is there a dress code?',
      },
      {
        speaker: 'Caller',
        text: "We recommend business casual, but we're not strict about it. Just no beachwear or overly casual attire.",
      },
      {
        speaker: 'AI Agent',
        text: "Understood. We'll see you at 7 PM. Thank you for confirming.",
      },
      {
        speaker: 'Caller',
        text: "You're welcome! We look forward to serving you tonight. If you need to cancel or change the time, please call us at least 2 hours in advance.",
      },
      {
        speaker: 'AI Agent',
        text: "I'll keep that in mind. Thanks again.",
      },
      {
        speaker: 'Caller',
        text: 'Our pleasure! See you tonight!',
      },
      {
        speaker: 'AI Agent',
        text: 'Looking forward to it. Goodbye.',
      },
      {
        speaker: 'Caller',
        text: 'Goodbye!',
      },
      {
        speaker: 'AI Agent',
        text: 'Thank you for the confirmation.',
      },
      {
        speaker: 'Caller',
        text: 'Our pleasure. Enjoy your evening!',
      },
      {
        speaker: 'AI Agent',
        text: 'You too.',
      },
      {
        speaker: 'Caller',
        text: 'See you tonight!',
      },
      {
        speaker: 'AI Agent',
        text: 'Have a great day!',
      },
    ],
  },
  {
    id: 'safe-5',
    type: 'safe',
    title: 'Utility Company Service Update',
    description: 'Legitimate utility company providing service information',
    expectedRisk: 4,
    transcript: [
      {
        speaker: 'AI Agent',
        text: 'Hello, this call is being screened by AI protection. How may I help you?',
      },
      {
        speaker: 'Caller',
        text: 'Hi, this is City Power and Light calling about a scheduled maintenance in your area.',
      },
      {
        speaker: 'AI Agent',
        text: "What's this regarding?",
      },
      {
        speaker: 'Caller',
        text: 'We have scheduled maintenance work on Tuesday from 9 AM to 3 PM. Your power may be temporarily interrupted during this time.',
      },
      {
        speaker: 'AI Agent',
        text: 'Is this necessary? I work from home and need internet access.',
      },
      {
        speaker: 'Caller',
        text: 'We understand the inconvenience. This maintenance is required to upgrade our infrastructure and prevent future outages. We recommend using a mobile hotspot as backup.',
      },
      {
        speaker: 'AI Agent',
        text: 'Okay, I understand. Will I receive any compensation for the outage?',
      },
      {
        speaker: 'Caller',
        text: "Yes, you'll receive a credit on your next bill proportional to the outage duration. It will be automatically applied.",
      },
      {
        speaker: 'AI Agent',
        text: "That's fair. Is there a way to get updates on the progress?",
      },
      {
        speaker: 'Caller',
        text: 'Yes, you can check our website or call our automated line at 1-800-POWER-ON for real-time updates.',
      },
      {
        speaker: 'AI Agent',
        text: "Thank you for the information. I'll plan accordingly.",
      },
      {
        speaker: 'Caller',
        text: "You're welcome. We apologize for any inconvenience and appreciate your patience.",
      },
      {
        speaker: 'AI Agent',
        text: "I understand it's necessary. Thanks for the advance notice.",
      },
      {
        speaker: 'Caller',
        text: 'Our pleasure. Is there anything else we can help you with today?',
      },
      {
        speaker: 'AI Agent',
        text: "No, that's all. Have a good day.",
      },
      {
        speaker: 'Caller',
        text: 'You too! Goodbye.',
      },
      {
        speaker: 'AI Agent',
        text: 'Goodbye.',
      },
      {
        speaker: 'Caller',
        text: 'Thank you for being a valued customer!',
      },
      {
        speaker: 'AI Agent',
        text: 'Thank you for the service.',
      },
      {
        speaker: 'Caller',
        text: 'Our pleasure. Take care!',
      },
      {
        speaker: 'AI Agent',
        text: 'You as well.',
      },
    ],
  },
];

export const ALL_CONVERSATIONS: ConversationTemplate[] = [
  ...SCAM_CONVERSATIONS,
  ...SAFE_CONVERSATIONS,
];

/**
 * Get a random conversation by type
 */
export function getRandomConversation(
  type: 'scam' | 'safe'
): ConversationTemplate {
  const conversations =
    type === 'scam' ? SCAM_CONVERSATIONS : SAFE_CONVERSATIONS;
  const randomIndex = Math.floor(Math.random() * conversations.length);
  return conversations[randomIndex];
}

/**
 * Get a conversation by ID
 */
export function getConversationById(
  id: string
): ConversationTemplate | undefined {
  return ALL_CONVERSATIONS.find((conv) => conv.id === id);
}

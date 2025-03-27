import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type FAQ = {
  question: string;
  answer: string;
};

export function FAQSection() {
  const faqs: FAQ[] = [
    {
      question: "How do I schedule a waste pickup?",
      answer: "Once you register as a customer, you can submit a waste report with details and images of the waste. Nearby dealers will receive your request, and once accepted, you'll be notified of the scheduled pickup time."
    },
    {
      question: "What types of waste can be collected?",
      answer: "Our platform handles various types of waste including recyclables (paper, plastic, glass, metal), electronic waste, and general household waste. Hazardous materials require special handling and should be noted in your report."
    },
    {
      question: "How does the donation system work?",
      answer: "After registering, you can list unused items you wish to donate. Organizations on our platform can browse these listings and request items they need. Once matched, arrangements for pickup or delivery can be made directly through the platform."
    },
    {
      question: "Do I need to segregate waste before pickup?",
      answer: "Yes, we highly encourage waste segregation. If you're unsure how to properly segregate your waste, our Media section provides educational resources. Dealers may also guide you during the pickup process."
    },
    {
      question: "What are social points and how do I earn them?",
      answer: "Social points are rewards for your environmental contributions. You earn points for activities like scheduling pickups, donating items, participating in events, and sharing educational content. These points can be tracked on your dashboard."
    },
    {
      question: "How can I join community cleanup events?",
      answer: "All upcoming events are listed in the Events section. You can browse events near your location, view details, and register to participate. Organizations can also create and manage their own community events."
    },
    {
      question: "I want to become a dealer. What should I do?",
      answer: "During registration, select 'Dealer' as your role. Once registered, you'll have access to the dealer dashboard where you can view and accept pickup requests in your area."
    },
    {
      question: "How can organizations request specific donations?",
      answer: "Organizations can browse available donations and request items that match their needs. Alternatively, they can post specific requests that will be visible to users who wish to donate."
    }
  ];

  return (
    <Card className="h-fit">
      <CardHeader>
        <CardTitle>Frequently Asked Questions</CardTitle>
      </CardHeader>
      <CardContent>
        <Accordion type="single" collapsible className="w-full">
          {faqs.map((faq, index) => (
            <AccordionItem key={index} value={`item-${index}`}>
              <AccordionTrigger className="text-left">{faq.question}</AccordionTrigger>
              <AccordionContent>{faq.answer}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </CardContent>
    </Card>
  );
}

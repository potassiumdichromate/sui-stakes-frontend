import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export default function FAQ() {
  const faqs = [
    {
      qus: "Is there a free trial available?",
      ans: "Yes, you can try us for free for 30 days. If you want, we'll provide you with a free, personalized 30-minute onboarding call to get you up and running as soon as possible.",
    },
    {
      qus: "Is there a free trial available?",
      ans: "Yes, you can try us for free for 30 days. If you want, we'll provide you with a free, personalized 30-minute onboarding call to get you up and running as soon as possible.",
    },
    {
      qus: "Is there a free trial available?",
      ans: "Yes, you can try us for free for 30 days. If you want, we'll provide you with a free, personalized 30-minute onboarding call to get you up and running as soon as possible.",
    },
    {
      qus: "Is there a free trial available?",
      ans: "Yes, you can try us for free for 30 days. If you want, we'll provide you with a free, personalized 30-minute onboarding call to get you up and running as soon as possible.",
    },
    {
      qus: "Is there a free trial available?",
      ans: "Yes, you can try us for free for 30 days. If you want, we'll provide you with a free, personalized 30-minute onboarding call to get you up and running as soon as possible.",
    },
  ];
  return (
    <div className="p-6">
      <div className="space-y-6 bg-[#1A1F3F] border-[#2B4286] p-4 rounded">
        <div className="flex items-center gap-6">
          <div className="w-full h-[1px] border border-border" />
          <p className="whitespace-nowrap text-muted font-medium">
            RECENTLY ASKED QUESTIONS
          </p>
          <div className="w-full h-[1px] border border-border" />
        </div>

        <Accordion type="single" collapsible>
          <div className="grid grid-cols-2 gap-4">
            {faqs.map((item, index) => (
              <AccordionItem key={index} value={`item-${index}`}>
                <AccordionTrigger
                  className={`uppercase hover:no-underline bg-[linear-gradient(180deg,#144E8E_-16.35%,#1D8FE5_139.42%)] rounded-lg px-4`}
                >
                  {item.qus}
                </AccordionTrigger>
                <AccordionContent
                  className={`no-underline bg-[rgba(22,126,205,0.18)] border border-[rgba(22,126,205,0.25)] p-4 leading-normal rounded-b-lg`}
                >
                  {item.ans}
                </AccordionContent>
              </AccordionItem>
            ))}
          </div>
        </Accordion>
      </div>
    </div>
  );
}

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { games } from "@/constants";

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
    <div className="p-6 space-y-6">
      <div className="flex flex-col items-start lg:flex-row lg:items-stretch">
        <div className="bg-[#1C2353] p-2 flex flex-col items-center justify-center gap-2 max-lg:rounded-t-xl lg:rounded-l-xl">
          <p className="uppercase font-bold lg:[writing-mode:vertical-rl] lg:rotate-180">
            live games
          </p>
          <div className="max-lg:hidden w-3 h-3 bg-green-500 rounded-full" />
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-6 gap-4 border border-[#1C2353] p-4 lg:bg-neutral-800 rounded-r-xl">
          {games.slice(11, 17).map((item, index) => (
            <div key={index} className="relative rounded-xl overflow-hidden">
              <img
                src={item.image}
                alt="img"
                width={217.023}
                height={160}
                className="w-full h-[160px] object-cover"
              />

              <div className="absolute inset-0 flex items-end p-4 bg-gradient-to-b from-transparent from-[25%] to-black/50">
                <h1 className="text-xl leading-tight font-bold uppercase">
                  {item.title}
                </h1>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="space-y-6 bg-[#1A1F3F] border-[#2B4286] p-4 rounded">
        <div className="flex items-center gap-6">
          <div className="w-full h-[1px] border border-border" />
          <p className="whitespace-nowrap text-muted font-medium">
            RECENTLY ASKED QUESTIONS
          </p>
          <div className="w-full h-[1px] border border-border" />
        </div>

        <div className="grid lg:grid-cols-2 gap-4">
          <Accordion type="single" collapsible>
            <div className="grid gap-4">
              {faqs.slice(0, 3).map((item, index) => (
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

          <Accordion type="single" collapsible>
            <div className="grid gap-4">
              {faqs.slice(3, 5).map((item, index) => (
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
    </div>
  );
}

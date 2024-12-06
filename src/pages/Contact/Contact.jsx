import ContactImg from "@/assets/imgs/others/contact-img.png"
import Button from "@/components/Button"
import { games } from "@/constants"

export default function Contact() {
  return (
    <div className='p-6 space-y-6'>
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
            Contact Us
          </p>
          <div className="w-full h-[1px] border border-border" />
        </div>

        <div className="flex flex-col-reverse lg:flex-row items-center gap-8">
        <img src={ContactImg} alt="img" />
        <form className="w-full flex flex-col gap-4">
          <div className="flex items-center gap-4">
            <input type="text" placeholder="First Name" className="w-full bg-[#27376E] p-3 rounded-xl"/>
            <input type="text" placeholder="Last Name" className="w-full bg-[#27376E] p-3 rounded-xl"/>
          </div>
          <input type="email" placeholder="Email Address" className="w-full bg-[#27376E] p-3 rounded-xl"/>
          <textarea name="" id="" placeholder="Write your message here.." className="w-full h-[200px] bg-[#27376E] p-3 rounded-xl"></textarea>
          <Button className="self-start">Send Message</Button>
        </form>
        </div>
      </div>
    </div>
  )
}

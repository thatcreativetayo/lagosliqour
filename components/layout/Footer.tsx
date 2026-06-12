import Link from "next/link";
import {
  InstagramLogo,
  TwitterLogo,
  FacebookLogo,
} from "@phosphor-icons/react/dist/ssr";

const shopLinks = [
  "Red Wines",
  "White Wines",
  "Sparkling",
  "Rosé",
  "Gifts",
];

const companyLinks = [
  { label: "About", href: "/about" },
  { label: "Our Story", href: "/about" },
  { label: "Contact", href: "/contact" },
  { label: "Careers", href: "/contact" },
];

const supportLinks = [
  "FAQ",
  "Delivery Info",
  "Returns",
  "Track Order",
];

function FooterLogo() {
  return (
    <div className="flex flex-col items-start gap-3">
      <div className="flex items-center gap-2">
        <svg width="24" height="24" viewBox="0 0 720 720" fill="none" aria-hidden>
          <path
            d="M577.491 291.572L516.263 83.6437C514.891 78.9852 512.048 74.8956 508.16 71.9859C504.272 69.0762 499.547 67.5025 494.691 67.5H225.309C220.453 67.5025 215.728 69.0762 211.84 71.9859C207.952 74.8956 205.109 78.9852 203.738 83.6437L142.509 291.572C132.903 323.442 132.4 357.363 141.058 389.504C149.716 421.644 167.189 450.724 191.503 473.456C231.5 510.965 282.89 534.022 337.5 538.959V627.5L247.5 652.5C241 654 235.81 654.871 231.59 659.09C227.371 663.31 225 669.033 225 675C225 680.967 227.371 686.69 231.59 690.91C235.81 695.129 241.533 697.5 247.5 697.5H472.5C478.467 697.5 484.19 695.129 488.41 690.91C492.63 686.69 495 680.967 495 675C495 669.033 492.63 663.31 488.41 659.09C484.19 654.871 478.5 654.5 472.5 652.5L382.5 627.5V538.959C437.109 534.017 488.498 510.961 528.497 473.456C552.811 450.724 570.284 421.644 578.942 389.504C587.6 357.363 587.097 323.442 577.491 291.572Z"
            fill="#EFECE4"
          />
          <path
            d="M242.128 112.5H477.872L534.375 304.284C474.834 328.416 406.997 302.316 370.181 283.669C299.334 247.809 243.084 243.253 201.6 250.116L242.128 112.5Z"
            fill="#6D1B1A"
          />
        </svg>
        <span className="font-display text-[15px] tracking-[1px] text-cream/90">
          Lagos Liquor
        </span>
      </div>
      <p className="font-ui text-[13px] font-light text-cream/40 max-w-[220px] leading-relaxed">
        Premium wines and spirits. Delivered across Lagos.
      </p>
      <div className="flex gap-4 mt-2">
        <a href="#" aria-label="Instagram" className="text-cream/40 hover:text-gold transition-colors">
          <InstagramLogo size={20} weight="thin" />
        </a>
        <a href="#" aria-label="Twitter" className="text-cream/40 hover:text-gold transition-colors">
          <TwitterLogo size={20} weight="thin" />
        </a>
        <a href="#" aria-label="Facebook" className="text-cream/40 hover:text-gold transition-colors">
          <FacebookLogo size={20} weight="thin" />
        </a>
      </div>
    </div>
  );
}

export default function Footer() {
  return (
    <footer className="bg-[#1A0D0D] border-t border-white/5 text-cream/40">
      <div className="max-w-[1400px] mx-auto px-6 sm:px-10 lg:px-16 py-12 sm:py-16 lg:py-20">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:flex lg:justify-between gap-8 sm:gap-12 lg:gap-8">
          <FooterLogo />

          <div>
            <h4 className="text-label font-serif text-cream/60 mb-4 sm:mb-6">Shop</h4>
            <ul className="flex flex-col gap-2 sm:gap-3">
              {shopLinks.map((item) => (
                <li key={item}>
                  <Link
                    href="/shop"
                    className="font-ui text-[13px] font-light hover:text-gold transition-colors"
                  >
                    {item}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* <div>
            <h4 className="text-label text-cream/60 mb-6">Company</h4>
            <ul className="flex flex-col gap-3">
              {companyLinks.map((item) => (
                <li key={item.label}>
                  <Link
                    href={item.href}
                    className="font-ui text-[13px] font-light hover:text-gold transition-colors"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div> */}

          {/* <div>
            <h4 className="text-label text-cream/60 mb-6">Support</h4>
            <ul className="flex flex-col gap-3">
              {supportLinks.map((item) => (
                <li key={item}>
                  <Link
                    href="/contact"
                    className="font-ui text-[13px] font-light hover:text-gold transition-colors"
                  >
                    {item}
                  </Link>
                </li>
              ))}
            </ul>
          </div>*/}
        </div> 

        <div className="mt-12 sm:mt-16 pt-6 sm:pt-8 border-t border-white/5 flex flex-col sm:flex-row justify-between gap-3 sm:gap-4 items-start sm:items-center">
          <p className="font-serif text-[12px] font-light">
            © 2026 Lagos Liquor. All rights reserved.
          </p>
          <div className="flex gap-4 sm:gap-6 font-ui text-[12px] font-light">
            <Link href="/contact" className="hover:text-gold transition-colors">
              Privacy
            </Link>
            <Link href="/contact" className="hover:text-gold transition-colors">
              Terms
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, useReducedMotion } from "framer-motion";

type TaglineRevealProps = {
  text: string;
  onDone?: () => void;
};

const TaglineReveal = ({ text, onDone }: TaglineRevealProps) => {
  const reduce = useReducedMotion();

  return (
    <motion.p
      className="font-['Pretendard'] text-[clamp(1.0rem,1.6vw,1.2rem)] font-medium leading-relaxed text-slate-700 tracking-[-0.01em]"
      initial={reduce ? { opacity: 1 } : { opacity: 0, y: 8, filter: "blur(6px)" }}
      animate={reduce ? { opacity: 1 } : { opacity: 1, y: 0, filter: "blur(0px)" }}
      transition={reduce ? {} : { duration: 0.75, delay: 0.18, ease: [0.22, 1, 0.36, 1] }}
      onAnimationComplete={() => onDone?.()}
    >
      <span className="relative inline-block overflow-hidden align-bottom">
        <motion.span
          aria-hidden
          className="absolute inset-0"
          style={{ background: "#FFFFFF" }}
          initial={reduce ? { x: "100%" } : { x: "0%" }}
          animate={{ x: "100%" }}
          transition={reduce ? {} : { duration: 0.7, delay: 0.18, ease: [0.22, 1, 0.36, 1] }}
        />
        <span>{text}</span>
      </span>
    </motion.p>
  );
};

const SplashPage = () => {
  const navigate = useNavigate();
  const reduce = useReducedMotion();

  const tagline = "가장 낮은 눈높이에서, 가장 높은 서비스를";
  const [taglineDone, setTaglineDone] = useState(false);

  // 태그라인이 완전히 보여진 뒤, 사용자가 읽을 시간을 보장
  const READ_HOLD_MS = 900;

  // reduce motion이면 짧게 노출 후 이동
  useEffect(() => {
    if (!reduce) return;
    const t = setTimeout(() => navigate("/login"), 900);
    return () => clearTimeout(t);
  }, [reduce, navigate]);

  // 태그라인 애니메이션이 끝난 다음에 이동 (읽을 시간 보장)
  useEffect(() => {
    if (reduce) return;
    if (!taglineDone) return;
    const t = setTimeout(() => navigate("/login"), READ_HOLD_MS);
    return () => clearTimeout(t);
  }, [taglineDone, reduce, navigate]);

  const v = useMemo(() => {
    if (reduce) {
      return {
        page: { initial: { opacity: 1 }, animate: { opacity: 1 } },
        block: { initial: { opacity: 1, y: 0 }, animate: { opacity: 1, y: 0 } },
        logo: { initial: { opacity: 1, scale: 1 }, animate: { opacity: 1, scale: 1 } },
        word: { initial: { opacity: 1, y: 0 }, animate: { opacity: 1, y: 0 } },
      };
    }
    return {
      page: {
        initial: { opacity: 0 },
        animate: { opacity: 1, transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] } },
      },
      block: {
        initial: { opacity: 0, y: 12 },
        animate: { opacity: 1, y: 0, transition: { duration: 0.8, ease: [0.22, 1, 0.36, 1] } },
      },
      logo: {
        initial: { opacity: 0, scale: 0.98 },
        animate: {
          opacity: 1,
          scale: 1,
          transition: { duration: 0.9, delay: 0.05, type: "spring", stiffness: 110, damping: 18 },
        },
      },
      word: {
        initial: { opacity: 0, y: 10 },
        animate: {
          opacity: 1,
          y: 0,
          transition: { duration: 0.9, delay: 0.14, ease: [0.22, 1, 0.36, 1] },
        },
      },
    };
  }, [reduce]);

  return (
    <motion.div
      className="relative min-h-dvh w-full overflow-hidden"
      variants={v.page}
      initial="initial"
      animate="animate"
    >
      {/* bright airport tone */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(920px 600px at 18% 10%, rgba(0,100,255,0.14), rgba(0,100,255,0) 62%)," +
            "radial-gradient(820px 560px at 90% 88%, rgba(90,220,255,0.14), rgba(90,220,255,0) 62%)," +
            "linear-gradient(180deg, #FFFFFF 0%, #F8FBFF 55%, #EEF6FF 100%)",
        }}
      />

      {/* subtle noise (flat + texture) */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.06] mix-blend-multiply"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='160' height='160'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='160' height='160' filter='url(%23n)' opacity='.28'/%3E%3C/svg%3E\")",
        }}
      />

      {/* airy glow */}
      <motion.div
        aria-hidden
        className="pointer-events-none absolute -top-28 -right-36 h-[520px] w-[520px] rounded-full blur-3xl"
        style={{ background: "radial-gradient(closest-side, rgba(0,100,255,0.16), rgba(0,100,255,0))" }}
        animate={reduce ? {} : { scale: [1, 1.03, 1], opacity: [0.88, 1, 0.88] }}
        transition={reduce ? {} : { duration: 8, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* Content */}
      <div className="relative z-10 mx-auto flex min-h-dvh max-w-screen-2xl items-center justify-center px-6 sm:px-10 lg:px-16">
        <motion.div variants={v.block} className="w-full">
          {/* spacing roomy */}
          <div className="mx-auto grid w-full max-w-[1100px] items-center gap-10 md:grid-cols-[auto,1fr] md:gap-16">
            {/* logo */}
            <motion.div variants={v.logo} className="relative mx-auto md:mx-0">
              <div
                aria-hidden
                className="pointer-events-none absolute -inset-10 rounded-[40px] blur-3xl"
                style={{
                  background:
                    "radial-gradient(closest-side, rgba(0,100,255,0.14), rgba(0,100,255,0))",
                }}
              />
              <img
                src="/images/logo.png"
                alt="CARRY PORTER Logo"
                className="h-[clamp(72px,10vw,132px)] w-[clamp(72px,10vw,132px)] object-contain drop-shadow-[0_14px_24px_rgba(0,60,140,0.14)]"
              />
            </motion.div>

            {/* wordmark */}
            <motion.div variants={v.word} className="text-center md:text-left">
              <div className="relative inline-block">
                {/* sheen */}
                <motion.span
                  aria-hidden
                  className="pointer-events-none absolute -inset-x-8 -inset-y-6"
                  style={{
                    background:
                      "linear-gradient(120deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.55) 14%, rgba(255,255,255,0) 28%)",
                    transform: "skewX(-18deg)",
                    filter: "blur(1px)",
                    maskImage: "linear-gradient(#000, #000)",
                    WebkitMaskImage: "linear-gradient(#000, #000)",
                  }}
                  initial={{ x: "-30%" }}
                  animate={reduce ? { x: "0%" } : { x: ["-35%", "115%"] }}
                  transition={reduce ? {} : { duration: 1.6, delay: 0.35, ease: "easeInOut" }}
                />

                <h1 className="select-none font-['Beckman',sans-serif] font-extrabold leading-[0.88] tracking-[-0.03em]">
                  <span className="block text-slate-900 text-[clamp(2.6rem,6.4vw,5.6rem)]">
                    CARRY
                  </span>
                  <span
                    className="block bg-clip-text text-transparent text-[clamp(2.6rem,6.4vw,5.6rem)]"
                    style={{
                      backgroundImage:
                        "linear-gradient(90deg, #0064FF 0%, #2B7BFF 42%, #5AD7FF 100%)",
                    }}
                  >
                    PORTER
                  </span>
                </h1>
              </div>

              {/* tagline reveal (no typing) */}
              <div className="mt-6 min-h-[2.2rem]">
                <TaglineReveal text={tagline} onDone={() => setTaglineDone(true)} />
              </div>

              {/* loading */}
              <div className="mt-10 flex justify-center md:justify-start">
                <div className="flex items-center gap-3">
                  {[0, 1, 2].map((i) => (
                    <motion.span
                      key={i}
                      className="h-2.5 w-2.5 rounded-full"
                      style={{ backgroundColor: "rgba(0,100,255,0.28)" }}
                      animate={reduce ? {} : { y: [0, -6, 0], opacity: [0.5, 1, 0.5] }}
                      transition={reduce ? {} : { duration: 0.85, repeat: Infinity, delay: i * 0.14, ease: "easeInOut" }}
                    />
                  ))}
                </div>
              </div>
            </motion.div>
          </div>

          <div className="mt-16 flex items-center justify-center">
            <p className="font-['Pretendard'] text-xs text-slate-400">© CARRY PORTER</p>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default SplashPage;

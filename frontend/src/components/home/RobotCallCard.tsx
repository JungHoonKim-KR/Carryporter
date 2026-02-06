interface RobotCallCardProps {
    onClick: () => void;
}

const RobotCallCard = ({ onClick }: RobotCallCardProps) => (
    <button
        onClick={onClick}
        className="w-full bg-white rounded-2xl p-4 shadow-sm transition-all active:scale-[0.98] flex items-center gap-3 mb-4 animate-fade-in-up"
        style={{ animationDelay: "100ms" }}
    >
        <div className="w-10 h-10 bg-toss-blue-50 rounded-xl flex items-center justify-center flex-shrink-0">
            <svg
                className="w-5 h-5 text-toss-blue-500"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
            >
                <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z"
                />
            </svg>
        </div>
        <div className="flex-1 text-left">
            <h3 className="text-gray-900 font-bold text-base">로봇 호출</h3>
            <p className="text-gray-500 text-sm">짐 운반 요청</p>
        </div>
        <svg
            className="w-5 h-5 text-gray-400 flex-shrink-0"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
        >
            <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
            />
        </svg>
    </button>
);

export default RobotCallCard;

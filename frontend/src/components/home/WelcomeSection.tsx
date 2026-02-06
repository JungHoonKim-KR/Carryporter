interface WelcomeSectionProps {
    email: string | undefined;
}

const WelcomeSection = ({ email }: WelcomeSectionProps) => (
    <div className="mb-4 animate-fade-in-up">
        <h2 className="text-heading-2 mb-1">안녕하세요 👋</h2>
        <p className="text-body-small">{email}님</p>
    </div>
);

export default WelcomeSection;

type SectionTitleProps = {
  title: string;
};

export const Title = ({ title }: SectionTitleProps) => {
  return (
    <h1 className="text-[var(--color-textSecondary)] font- text-2xl sm:text-3xl font-Robot font-medium leading-[40px]  ">
      {title}
    </h1>
  );
};

export default Title;

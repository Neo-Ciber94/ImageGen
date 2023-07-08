import { STATUS_CODES } from "http";
import { type NextPageContext } from "next";
import { ForEachCharacter } from "~/components/ForEachCharacter";

interface ErrorPageProps {
  statusCode: number;
  message?: string;
}

export default function ErrorPage({ statusCode, message }: ErrorPageProps) {
  const errorMessage =
    message || STATUS_CODES[statusCode] || "Something went wrong";
  return (
    <div
      className="flex h-[60vh] w-full cursor-pointer flex-row items-center justify-center gap-3 
    p-4 font-mono text-xl md:text-3xl text-violet-500"
    >
      <span>
        <ForEachCharacter
          text={statusCode.toString()}
          className={"hover:text-violet-400"}
        />
      </span>
      <span className="text-violet-500/50">|</span>
      <span>
        <ForEachCharacter
          text={errorMessage}
          className={"hover:text-violet-400"}
        />
      </span>
    </div>
  );
}

ErrorPage.getInitialProps = ({ res, err }: NextPageContext) => {
  const statusCode = res ? res.statusCode : err ? err.statusCode : 404;
  return { statusCode };
};

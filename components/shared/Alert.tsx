'use client';

interface AlertProps {
  error?: string;
}

export default function Alert({ error }: AlertProps) {
  return (
    <div
      className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative"
      role="alert"
    >
      <strong className="font-bold">Holy smokes!</strong>
      <span className="block sm:inline">
        {error ? error : 'Unauthorized. Only iitbbs.ac.in emails are allowed.'}
      </span>
      <span className="absolute top-0 bottom-0 right-0 px-4 py-3">
        <svg
          className="fill-current h-6 w-6 text-red-500"
          role="button"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 20 20"
        >
          <title>Close</title>
          <path d="M14.348 5.652a.5.5 0 0 1 0 .707L10.707 10l3.64 3.64a.5.5 0 0 1-.707.707L10 10.707 6.36 14.348a.5.5 0 0 1-.707-.707L9.293 10 5.652 6.36a.5.5 0 0 1 .707-.707L10 9.293l3.64-3.64a.5.5 0 0 1 .708 0z" />
        </svg>
      </span>
    </div>
  );
}

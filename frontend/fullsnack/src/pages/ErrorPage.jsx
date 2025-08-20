import Button from "react-bootstrap/Button";

export default function ErrorPage() {
    return (
        <div className="min-h-[70vh] flex items-center justify-center px-4">
            <div
                className="bg-white snack-card rounded-2xl border border-snack-100 shadow-snack max-w-md w-full p-8 text-center"
                role="alert"
                aria-live="assertive"
            >
                {/* Icon */}
                <div className="mx-auto mb-4 h-12 w-12 rounded-full bg-red-50 flex items-center justify-center">
                    <svg
                        className="h-6 w-6 text-red-500"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        aria-hidden="true"
                    >
                        <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                        <line x1="12" y1="9" x2="12" y2="13" />
                        <line x1="12" y1="17" x2="12" y2="17" />
                    </svg>
                </div>

                <h1 className="text-2xl font-bold mb-2 text-red-600">Something went wrong</h1>
                <p className="text-muted mb-6">
                    Try reloading the page or check your connection.
                </p>

                {/* Actions */}
                {/* Actions */}
                <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                    <Button
                        type="button"
                        onClick={() => window.location.reload()}
                        variant="primary"
                        className="w-full sm:w-auto rounded-pill"
                    >
                        Reload Page
                    </Button>
                    <Button
                        as="a"
                        href="/"
                        variant="outline-primary"
                        className="w-full sm:w-auto rounded-pill"
                    >
                        Go Home
                    </Button>
                </div>



                {/* Subtle divider + tip */}
                <hr className="snack-divider" />
                <p className="text-xs text-muted">
                    If this keeps happening, you may be offline or the server is temporarily unavailable.
                </p>
            </div>
        </div>
    );

}
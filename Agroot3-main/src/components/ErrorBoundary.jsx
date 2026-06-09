import React from "react";

class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null, errorInfo: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true };
    }

    componentDidCatch(error, errorInfo) {
        console.error("ErrorBoundary caught an error:", error, errorInfo);
        this.setState({ error, errorInfo });
    }

    render() {
        if (this.state.hasError) {
            return (
                <div className="min-h-screen bg-red-50 p-6 flex flex-col items-center justify-center text-red-900">
                    <h1 className="text-3xl font-bold mb-4">Something went wrong 🚨</h1>
                    <div className="bg-white p-4 rounded-xl shadow-xl w-full max-w-lg border border-red-200 overflow-auto">
                        <h2 className="text-xl font-semibold mb-2 text-red-700">Error:</h2>
                        <pre className="text-sm bg-red-100 p-2 rounded mb-4 whitespace-pre-wrap">
                            {this.state.error?.toString()}
                        </pre>
                        <h2 className="text-xl font-semibold mb-2 text-red-700">Stack Trace:</h2>
                        <pre className="text-xs bg-gray-100 p-2 rounded whitespace-pre-wrap overflow-x-auto">
                            {this.state.errorInfo?.componentStack}
                        </pre>
                        <button
                            onClick={() => window.location.href = "/"}
                            className="mt-6 w-full py-3 bg-red-600 text-white rounded-lg font-bold hover:bg-red-700 transition"
                        >
                            Restart App
                        </button>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;

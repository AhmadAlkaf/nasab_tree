import type { Metadata } from "next";
import "./globals.css";
import AppShell from "@/components/layout/AppShell";
import ToastContainer from "@/components/ui/ToastContainer";
import ThemeProvider from "@/components/providers/ThemeProvider";

export const metadata: Metadata = {
  title: "شجرة الأنساب - نظام إدارة الشجرة النسبية",
  description: "نظام متكامل لإدارة وتوثيق الشجرة النسبية مع دعم العلاقات الهرمية المعقدة",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ar" dir="rtl">
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator) {
                window.addEventListener('load', function() {
                  navigator.serviceWorker.getRegistrations().then(function(registrations) {
                    for(let registration of registrations) {
                      registration.unregister();
                      console.log('Unregistered old service worker');
                    }
                  });
                });
              }
            `,
          }}
        />
      </head>
      <body>
        <ThemeProvider>
          <AppShell>{children}</AppShell>
          <ToastContainer />
        </ThemeProvider>
      </body>
    </html>
  );
}

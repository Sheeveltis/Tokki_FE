import React from 'react'
import { BlogDetailSidebar } from './blog-detail-sidebar'

/**
 * BlogLayout (Web) — premium 2-col layout cho blog detail
 * max-width: 1400px, left: nội dung, right: sticky sidebar
 */
export function BlogLayout({ children, relatedPosts }) {
  return (
    <div className="bld-root">
      <style dangerouslySetInnerHTML={{
        __html: `
        @import url('https://fonts.googleapis.com/css2?family=Epilogue:wght@400;500;600;700;800;900&display=swap');

        .bld-root {
          font-family: 'Epilogue', sans-serif;
          background: linear-gradient(180deg, #FEF7E6 0%, #FFFFFF 280px);
          min-height: 100vh;
        }

        .bld-wrapper {
          max-width: 1400px;
          margin: 0 auto;
          padding: 40px 24px 80px;
          display: grid;
          grid-template-columns: 1fr 320px;
          gap: 56px;
          align-items: start;
        }

        @media (max-width: 1024px) {
          .bld-wrapper {
            grid-template-columns: 1fr;
          }
          .bld-sidebar-col {
            display: none;
          }
        }

        .bld-main-col {
          min-width: 0;
        }

        .bld-sidebar-col {
          position: sticky;
          top: 100px;
        }
        `
      }} />

      <div className="bld-wrapper">
        <div className="bld-main-col">
          {children}
        </div>
        <div className="bld-sidebar-col">
          <BlogDetailSidebar relatedPosts={relatedPosts} />
        </div>
      </div>
    </div>
  )
}
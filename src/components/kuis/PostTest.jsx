import React from 'react'
import PreTest from './PreTest' // Menggunakan QuizRunner universal yang sudah mendukung Pengetahuan & Sikap

function PostTest({ category = 'h1_posttest_pengetahuan', onBack }) {
  return (
    <PreTest 
      category={category} 
      onBack={onBack} 
    />
  )
}

export default PostTest
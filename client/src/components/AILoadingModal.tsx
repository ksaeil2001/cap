import { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Progress } from '@/components/ui/progress';

interface AILoadingModalProps {
  isOpen: boolean;
  onComplete: () => void;
}

export const AILoadingModal = ({ isOpen, onComplete }: AILoadingModalProps) => {
  const [progress, setProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState(0);

  const steps = [
    "사용자 정보 분석 중...",
    "영양소 균형 계산 중...",
    "예산 최적화 중...",
    "끼니별 구성 중...",
    "브랜드 다양성 검토 중...",
    "최적 식단 완성!"
  ];

  useEffect(() => {
    if (!isOpen) return;

    let interval: NodeJS.Timeout;
    let stepTimeout: NodeJS.Timeout;

    const startLoading = () => {
      setProgress(0);
      setCurrentStep(0);

      // 프로그레스 바 애니메이션
      interval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 100) {
            clearInterval(interval);
            setTimeout(() => onComplete(), 500);
            return 100;
          }
          return prev + 2;
        });
      }, 50);

      // 단계별 텍스트 변경
      stepTimeout = setInterval(() => {
        setCurrentStep(prev => {
          if (prev >= steps.length - 1) {
            clearInterval(stepTimeout);
            return prev;
          }
          return prev + 1;
        });
      }, 500);
    };

    startLoading();

    return () => {
      clearInterval(interval);
      clearInterval(stepTimeout);
    };
  }, [isOpen, onComplete, steps.length]);

  return (
    <Dialog open={isOpen} onOpenChange={() => {}}>
      <DialogContent className="sm:max-w-md">
        <DialogTitle className="sr-only">AI 맞춤 식단 구성 중</DialogTitle>
        <DialogDescription className="sr-only">
          입력하신 정보를 기반으로 AI가 최적의 식단을 구성하고 있습니다.
        </DialogDescription>
        <div className="flex flex-col items-center space-y-6 py-8">
          {/* AI 아이콘 애니메이션 */}
          <div className="relative">
            <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center animate-pulse">
              <svg 
                className="w-8 h-8 text-white animate-spin" 
                fill="none" 
                viewBox="0 0 24 24"
              >
                <circle 
                  className="opacity-25" 
                  cx="12" 
                  cy="12" 
                  r="10" 
                  stroke="currentColor" 
                  strokeWidth="4"
                />
                <path 
                  className="opacity-75" 
                  fill="currentColor" 
                  d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
            </div>
            <div className="absolute -top-1 -right-1 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
              <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            </div>
          </div>

          {/* 제목 */}
          <div className="text-center space-y-2">
            <h2 className="text-xl font-bold text-gray-900">AI 맞춤 식단 구성 중</h2>
            <p className="text-gray-600 text-sm">
              입력하신 정보를 기반으로, AI가 최적의 식단을 구성하고 있어요.
            </p>
          </div>

          {/* 진행 상황 */}
          <div className="w-full space-y-4">
            <div className="text-center">
              <p className="text-sm font-medium text-blue-600 mb-2">
                {steps[currentStep]}
              </p>
              <Progress value={progress} className="h-2" />
              <p className="text-xs text-gray-500 mt-2">
                {Math.round(progress)}% 완료
              </p>
            </div>
          </div>

          {/* 추가 설명 */}
          <div className="text-center space-y-2">
            <p className="text-xs text-gray-500 max-w-sm">
              영양소 균형, 예산, 끼니별 구성, 브랜드 다양성을 고려 중입니다.
            </p>
            <div className="flex items-center justify-center space-x-1">
              <div className="w-1 h-1 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
              <div className="w-1 h-1 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
              <div className="w-1 h-1 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AILoadingModal;
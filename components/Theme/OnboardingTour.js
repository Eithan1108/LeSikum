"use client";

import React, { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  X,
  ChevronLeft,
  ChevronRight,
  HelpCircle,
  CheckCircle,
  Compass,
} from "lucide-react";
import Image from "next/image";

export default function OnboardingTour({ steps, onComplete, theme = "light" }) {
  const [currentStep, setCurrentStep] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const cardRef = useRef(null);

  const totalPages = steps.length;

  useEffect(() => {
    if (isVisible && !isMinimized) {
      const targetElement = document.querySelector(steps[currentStep].target);
      if (targetElement) {
        targetElement.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    }
  }, [currentStep, steps, isVisible, isMinimized]);

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      setIsVisible(false);
      onComplete();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSkip = () => {
    setIsVisible(false);
    onComplete();
  };

  const handleMinimize = () => {
    setIsMinimized(!isMinimized);
  };

  const handleRestart = () => {
    setCurrentStep(0);
    setIsMinimized(false);
  };

  const handleStartTour = () => {
    setIsVisible(true);
    setIsMinimized(false);
    setCurrentStep(0);
  };

  const themeClasses =
    theme === "dark" ? "bg-gray-800 text-white" : "bg-white text-gray-800";

  return (
    <>
      <Button
        className="fixed bottom-4 right-4 z-50 bg-orange-500 text-white rounded-lg w-auto h-auto px-4 py-3 flex items-center justify-center shadow-lg transition-all duration-300 ease-in-out hover:bg-orange-600 group"
        onClick={handleStartTour}
      >
        <Compass className="h-4 w-4 mr-2 group-hover:animate-spin transition-all duration-300" />
        <span className="font-semibold">Explore</span>
      </Button>

      {isVisible && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm transition-all duration-300 ease-in-out">
          <div
            className={`${isMinimized ? "w-12" : "w-full max-w-3xl"} transition-all duration-300 ease-in-out`}
          >
            {isMinimized ? (
              <Button
                className="bg-orange-500 hover:bg-orange-600 text-white rounded-full w-12 h-12 flex items-center justify-center shadow-lg transition-all duration-300 ease-in-out transform hover:scale-110"
                onClick={handleMinimize}
              >
                <HelpCircle className="h-6 w-6" />
              </Button>
            ) : (
              <Card
                className={`${themeClasses} shadow-2xl rounded-xl overflow-hidden`}
                ref={cardRef}
              >
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 bg-orange-500 text-white">
                  <CardTitle className="text-xl font-bold">Web Explore</CardTitle>
                  <div className="flex space-x-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleSkip}
                      className="text-white hover:bg-orange-600"
                    >
                      <X className="h-5 w-5" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="p-6">
                  <h3 className="font-semibold text-2xl mb-3 text-orange-600">
                    {steps[currentStep].title}
                  </h3>
                  <p className="text-base mb-4 text-gray-600">
                    {steps[currentStep].content}
                  </p>
                  {steps[currentStep].image && (
                    <div className="relative w-full h-64 mb-4 rounded-lg overflow-hidden">
                      <Image
                        src={steps[currentStep].image}
                        alt={steps[currentStep].title}
                        layout="fill"
                        objectFit="cover"
                        className="transition-all duration-300 ease-in-out transform hover:scale-105"
                      />
                    </div>
                  )}
                  <div className="text-sm text-gray-500 text-center mt-4">
                    Page {currentStep + 1} of {totalPages}
                  </div>
                </CardContent>
                <CardFooter className="flex justify-between bg-gray-100 p-4">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handlePrevious}
                    disabled={currentStep === 0}
                    className="text-orange-500 border-orange-500 hover:bg-orange-100"
                  >
                    <ChevronLeft className="h-4 w-4 mr-2" />
                    Previous
                  </Button>
                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleRestart}
                      className="text-orange-500 border-orange-500 hover:bg-orange-100"
                    >
                      Restart
                    </Button>
                    <Button
                      className="bg-orange-500 hover:bg-orange-600 text-white"
                      size="sm"
                      onClick={handleNext}
                    >
                      {currentStep === steps.length - 1 ? (
                        <>
                          Finish
                          <CheckCircle className="h-4 w-4 ml-2" />
                        </>
                      ) : (
                        <>
                          Next
                          <ChevronRight className="h-4 w-4 ml-2" />
                        </>
                      )}
                    </Button>
                  </div>
                </CardFooter>
              </Card>
            )}
          </div>
        </div>
      )}
    </>
  );
}
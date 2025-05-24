import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { 
  Form, 
  FormControl, 
  FormField, 
  FormItem, 
  FormLabel,
  FormMessage
} from "@/components/ui/form";
import { 
  RadioGroup, 
  RadioGroupItem 
} from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { useUserStore } from "@/stores/useUserStore";
import { useToast } from "@/hooks/use-toast";

const allergyOptions = [
  { id: "eggs", label: "Eggs" },
  { id: "milk", label: "Milk" },
  { id: "peanuts", label: "Peanuts" },
  { id: "fish", label: "Fish" },
  { id: "shellfish", label: "Shellfish" },
  { id: "soy", label: "Soy" },
  { id: "wheat", label: "Wheat" },
];

const formSchema = z.object({
  gender: z.enum(["male", "female"]),
  age: z.coerce.number().min(10, "Age must be at least 10 years").max(120, "Age must be less than 120 years"),
  height: z.coerce.number().min(100, "Height must be at least 100 cm").max(250, "Height must be less than 250 cm"),
  weight: z.coerce.number().min(30, "Weight must be at least 30 kg").max(250, "Weight must be less than 250 kg"),
  bodyFatPercent: z.coerce.number().min(5, "Body fat must be at least 5%").max(50, "Body fat must be less than 50%").optional(),
  goal: z.enum(["weight-loss", "muscle-gain"]),
  activityLevel: z.enum(["low", "medium", "high"]).optional(),
  budget: z.coerce.number().min(20, "Budget must be at least $20"),
  mealCount: z.enum(["2", "3"]).default("3"),
  allergies: z.array(z.string()).default([]),
  consent: z.boolean().refine(val => val === true, {
    message: "You must consent to data usage for meal recommendations",
  }),
});

type FormValues = z.infer<typeof formSchema>;

const MainInputPage = () => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();
  const setUserInfo = useUserStore(state => state.setUserInfo);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      gender: "male",
      age: undefined,
      height: undefined,
      weight: undefined,
      bodyFatPercent: undefined,
      goal: "weight-loss",
      activityLevel: undefined,
      budget: undefined,
      mealCount: "3",
      allergies: [],
      consent: false,
    },
  });

  const onSubmit = async (data: FormValues) => {
    setLoading(true);
    try {
      // Store the user info in Zustand
      setUserInfo({
        gender: data.gender,
        age: data.age,
        height: data.height,
        weight: data.weight,
        bodyFatPercent: data.bodyFatPercent,
        goal: data.goal,
        activityLevel: data.activityLevel,
        budget: data.budget,
        mealCount: parseInt(data.mealCount),
        allergies: data.allergies,
      });

      // Navigate to the recommend page
      navigate("/recommend");
    } catch (error) {
      console.error("Error:", error);
      toast({
        title: "Error",
        description: "Failed to submit form. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mb-8">
      <div className="max-w-2xl mx-auto">
        <div className="mb-8 text-center">
          <h2 className="text-3xl font-heading font-bold mb-4">Personalized Meal Planning</h2>
          <p className="text-neutral-600">Let's gather some information to create your perfect meal plan</p>
        </div>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="bg-white rounded-xl shadow-md p-6">
            <div className="flex flex-col md:flex-row md:space-x-4 mb-6">
              <div className="mb-4 md:mb-0 w-full md:w-1/2">
                <FormField
                  control={form.control}
                  name="gender"
                  render={({ field }) => (
                    <FormItem className="space-y-1">
                      <FormLabel className="text-sm font-medium text-neutral-700">Gender</FormLabel>
                      <FormControl>
                        <RadioGroup
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                          className="flex space-x-4"
                        >
                          <div className="flex items-center">
                            <RadioGroupItem value="male" id="male" className="text-primary focus:ring-primary" />
                            <label htmlFor="male" className="ml-2">Male</label>
                          </div>
                          <div className="flex items-center">
                            <RadioGroupItem value="female" id="female" className="text-primary focus:ring-primary" />
                            <label htmlFor="female" className="ml-2">Female</label>
                          </div>
                        </RadioGroup>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <div className="w-full md:w-1/2">
                <FormField
                  control={form.control}
                  name="age"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel htmlFor="age" className="text-sm font-medium text-neutral-700">Age (years)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          id="age"
                          placeholder="e.g. 30"
                          min={10}
                          max={120}
                          required
                          {...field}
                          value={field.value || ''}
                          className="w-full px-3 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>
            
            <div className="flex flex-col md:flex-row md:space-x-4 mb-6">
              <div className="mb-4 md:mb-0 w-full md:w-1/2">
                <FormField
                  control={form.control}
                  name="height"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel htmlFor="height" className="text-sm font-medium text-neutral-700">Height (cm)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          id="height"
                          placeholder="e.g. 175"
                          min={100}
                          max={250}
                          required
                          {...field}
                          value={field.value || ''}
                          className="w-full px-3 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <div className="w-full md:w-1/2">
                <FormField
                  control={form.control}
                  name="weight"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel htmlFor="weight" className="text-sm font-medium text-neutral-700">Weight (kg)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          id="weight"
                          placeholder="e.g. 70"
                          min={30}
                          max={250}
                          required
                          {...field}
                          value={field.value || ''}
                          className="w-full px-3 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            <div className="flex flex-col md:flex-row md:space-x-4 mb-6">
              <div className="mb-4 md:mb-0 w-full md:w-1/2">
                <FormField
                  control={form.control}
                  name="bodyFatPercent"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel htmlFor="bodyFat" className="text-sm font-medium text-neutral-700">Body Fat % (optional)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          id="bodyFat"
                          placeholder="e.g. 18"
                          min={5}
                          max={50}
                          {...field}
                          value={field.value || ''}
                          className="w-full px-3 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <div className="w-full md:w-1/2">
                <FormField
                  control={form.control}
                  name="activityLevel"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel htmlFor="activityLevel" className="text-sm font-medium text-neutral-700">Activity Level</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger className="w-full px-3 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary">
                            <SelectValue placeholder="Select activity level" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="low">Low</SelectItem>
                          <SelectItem value="medium">Medium</SelectItem>
                          <SelectItem value="high">High</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            <div className="flex flex-col md:flex-row md:space-x-4 mb-6">
              <div className="mb-4 md:mb-0 w-full md:w-1/2">
                <FormField
                  control={form.control}
                  name="goal"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel htmlFor="goal" className="text-sm font-medium text-neutral-700">Health Goal</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger className="w-full px-3 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary">
                            <SelectValue placeholder="Select your goal" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="weight-loss">Weight Loss</SelectItem>
                          <SelectItem value="muscle-gain">Muscle Gain</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <div className="w-full md:w-1/2">
                <FormField
                  control={form.control}
                  name="mealCount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel htmlFor="mealCount" className="text-sm font-medium text-neutral-700">Meals per day</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger className="w-full px-3 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary">
                            <SelectValue placeholder="Number of meals" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="2">2 meals</SelectItem>
                          <SelectItem value="3">3 meals</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            <div className="mb-6">
              <FormField
                control={form.control}
                name="budget"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel htmlFor="budget" className="text-sm font-medium text-neutral-700">Weekly Budget ($)</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                          <span className="text-neutral-500">$</span>
                        </div>
                        <Input
                          type="number"
                          id="budget"
                          placeholder="e.g. 100"
                          min={20}
                          required
                          {...field}
                          value={field.value || ''}
                          className="w-full pl-8 px-3 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="mb-6">
              <FormField
                control={form.control}
                name="allergies"
                render={() => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium text-neutral-700">Allergies or Restrictions (max 5)</FormLabel>
                    <div className="flex flex-wrap gap-2">
                      {allergyOptions.map((option) => (
                        <FormField
                          key={option.id}
                          control={form.control}
                          name="allergies"
                          render={({ field }) => {
                            return (
                              <FormItem className="inline-flex items-center bg-neutral-100 px-3 py-2 rounded-full">
                                <FormControl>
                                  <Checkbox
                                    checked={field.value?.includes(option.id)}
                                    onCheckedChange={(checked) => {
                                      if (checked && field.value.length >= 5) {
                                        toast({
                                          title: "Maximum allergies reached",
                                          description: "You can select a maximum of 5 allergies",
                                          variant: "destructive",
                                        });
                                        return;
                                      }
                                      return checked
                                        ? field.onChange([...field.value, option.id])
                                        : field.onChange(
                                            field.value?.filter(
                                              (value) => value !== option.id
                                            )
                                          )
                                    }}
                                    className="text-primary focus:ring-primary h-4 w-4"
                                  />
                                </FormControl>
                                <FormLabel className="ml-2 text-sm">
                                  {option.label}
                                </FormLabel>
                              </FormItem>
                            )
                          }}
                        />
                      ))}
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="mb-8">
              <FormField
                control={form.control}
                name="consent"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-2 space-y-0">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        className="text-primary focus:ring-primary h-4 w-4"
                      />
                    </FormControl>
                    <FormLabel className="text-sm text-neutral-600">
                      I consent to my data being used to generate personalized meal recommendations
                    </FormLabel>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-primary hover:bg-primary-600 text-white font-medium py-3 px-4 rounded-md transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
            >
              {loading ? "Processing..." : "Get Recommendations"}
            </Button>
          </form>
        </Form>
      </div>
    </div>
  );
};

export default MainInputPage;

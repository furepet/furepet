
-- Weight entries for pets
CREATE TABLE public.pet_weights (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  pet_id UUID NOT NULL REFERENCES public.pets(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  weight_value NUMERIC(6,2) NOT NULL,
  weight_unit TEXT NOT NULL DEFAULT 'lbs',
  recorded_date DATE NOT NULL DEFAULT CURRENT_DATE,
  note TEXT DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.pet_weights ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own pet weights" ON public.pet_weights FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own pet weights" ON public.pet_weights FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own pet weights" ON public.pet_weights FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own pet weights" ON public.pet_weights FOR DELETE USING (auth.uid() = user_id);

CREATE INDEX idx_pet_weights_pet_id ON public.pet_weights(pet_id);

-- Measurement entries for pets
CREATE TABLE public.pet_measurements (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  pet_id UUID NOT NULL REFERENCES public.pets(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  category TEXT NOT NULL,
  custom_category TEXT DEFAULT '',
  measurement_value NUMERIC(6,2) NOT NULL,
  measurement_unit TEXT NOT NULL DEFAULT 'in',
  recorded_date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.pet_measurements ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own pet measurements" ON public.pet_measurements FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own pet measurements" ON public.pet_measurements FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own pet measurements" ON public.pet_measurements FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own pet measurements" ON public.pet_measurements FOR DELETE USING (auth.uid() = user_id);

CREATE INDEX idx_pet_measurements_pet_id ON public.pet_measurements(pet_id);

-- Breed weight ranges reference table (public read)
CREATE TABLE public.breed_weight_ranges (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  species TEXT NOT NULL,
  breed TEXT NOT NULL,
  min_weight_lbs NUMERIC(5,1) NOT NULL,
  max_weight_lbs NUMERIC(5,1) NOT NULL,
  avg_weight_lbs NUMERIC(5,1) NOT NULL
);

ALTER TABLE public.breed_weight_ranges ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read breed weight ranges" ON public.breed_weight_ranges FOR SELECT USING (true);

CREATE UNIQUE INDEX idx_breed_weight_ranges_breed ON public.breed_weight_ranges(species, breed);

-- Populate top 50 dog breeds
INSERT INTO public.breed_weight_ranges (species, breed, min_weight_lbs, max_weight_lbs, avg_weight_lbs) VALUES
('Dog','Affenpinscher',7,10,8.5),
('Dog','Afghan Hound',50,60,55),
('Dog','Airedale Terrier',50,70,60),
('Dog','Akita',70,130,100),
('Dog','Alaskan Malamute',75,100,87.5),
('Dog','American Bulldog',60,100,80),
('Dog','Australian Cattle Dog',35,50,42.5),
('Dog','Australian Shepherd',40,65,52.5),
('Dog','Basenji',22,24,23),
('Dog','Basset Hound',40,65,52.5),
('Dog','Beagle',20,30,25),
('Dog','Bernese Mountain Dog',70,115,92.5),
('Dog','Bichon Frise',12,18,15),
('Dog','Border Collie',30,55,42.5),
('Dog','Boston Terrier',12,25,18.5),
('Dog','Boxer',50,80,65),
('Dog','Brittany',30,40,35),
('Dog','Bulldog',40,50,45),
('Dog','Cane Corso',88,110,99),
('Dog','Cavalier King Charles Spaniel',13,18,15.5),
('Dog','Chihuahua',2,6,4),
('Dog','Cocker Spaniel',20,30,25),
('Dog','Collie',50,75,62.5),
('Dog','Dachshund',16,32,24),
('Dog','Dalmatian',45,70,57.5),
('Dog','Doberman Pinscher',60,100,80),
('Dog','English Springer Spaniel',40,50,45),
('Dog','French Bulldog',16,28,22),
('Dog','German Shepherd Dog',50,90,70),
('Dog','German Shorthaired Pointer',45,70,57.5),
('Dog','Golden Retriever',55,75,65),
('Dog','Great Dane',110,175,142.5),
('Dog','Havanese',7,13,10),
('Dog','Irish Setter',60,70,65),
('Dog','Italian Greyhound',7,14,10.5),
('Dog','Jack Russell Terrier',13,17,15),
('Dog','Labrador Retriever',55,80,67.5),
('Dog','Maltese',4,7,5.5),
('Dog','Miniature Schnauzer',11,20,15.5),
('Dog','Newfoundland',100,150,125),
('Dog','Pembroke Welsh Corgi',25,30,27.5),
('Dog','Pomeranian',3,7,5),
('Dog','Poodle',40,70,55),
('Dog','Pug',14,18,16),
('Dog','Rottweiler',80,135,107.5),
('Dog','Saint Bernard',120,180,150),
('Dog','Samoyed',35,65,50),
('Dog','Shetland Sheepdog',15,25,20),
('Dog','Shiba Inu',17,23,20),
('Dog','Shih Tzu',9,16,12.5),
('Dog','Siberian Husky',35,60,47.5),
('Dog','Staffordshire Bull Terrier',24,38,31),
('Dog','Vizsla',44,60,52),
('Dog','Weimaraner',55,90,72.5),
('Dog','West Highland White Terrier',15,20,17.5),
('Dog','Whippet',25,40,32.5),
('Dog','Yorkshire Terrier',4,7,5.5),
-- Top cat breeds
('Cat','Abyssinian',8,12,10),
('Cat','American Shorthair',8,15,11.5),
('Cat','Bengal',8,15,11.5),
('Cat','Birman',7,12,9.5),
('Cat','Bombay',6,11,8.5),
('Cat','British Shorthair',9,18,13.5),
('Cat','Burmese',6,14,10),
('Cat','Chartreux',7,16,11.5),
('Cat','Cornish Rex',5,10,7.5),
('Cat','Devon Rex',5,10,7.5),
('Cat','Egyptian Mau',7,11,9),
('Cat','Exotic',7,14,10.5),
('Cat','Maine Coon',10,25,17.5),
('Cat','Manx',8,12,10),
('Cat','Norwegian Forest Cat',12,16,14),
('Cat','Ocicat',6,15,10.5),
('Cat','Oriental',5,10,7.5),
('Cat','Persian',7,12,9.5),
('Cat','Ragdoll',10,20,15),
('Cat','Russian Blue',7,15,11),
('Cat','Scottish Fold',6,13,9.5),
('Cat','Siamese',6,14,10),
('Cat','Siberian',10,20,15),
('Cat','Singapura',4,8,6),
('Cat','Somali',6,10,8),
('Cat','Sphynx',6,12,9),
('Cat','Tonkinese',6,12,9),
('Cat','Turkish Angora',5,10,7.5),
('Cat','Turkish Van',7,20,13.5);

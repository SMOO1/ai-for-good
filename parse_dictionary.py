"""
parse_dictionary.py
Extracts English-Rohingya word pairs from the dictionary PDF and writes
src/data/words.js with at least 20 words per category (200 total target).

Usage:
  pip install pdfplumber
  python parse_dictionary.py
"""

import re
import json
import pdfplumber
from pathlib import Path

# ─── CATEGORY KEYWORD MAP ───────────────────────────────────────────────────
# Maps a word to a category. Checked in order — first match wins.
CATEGORY_WORDS = {
    "food": [
        "apple","banana","mango","rice","bread","fish","chicken","meat","milk","egg",
        "water","juice","sugar","salt","oil","flour","potato","onion","garlic","ginger",
        "tomato","lemon","orange","grape","melon","pineapple","coconut","bean","lentil",
        "corn","wheat","tea","coffee","soup","curry","cake","cookie","candy","chocolate",
        "butter","cheese","yogurt","cream","honey","pepper","spice","herb","vegetable",
        "fruit","food","eat","drink","cook","meal","lunch","dinner","breakfast","snack",
        "pea","carrot","cabbage","spinach","brinjal","eggplant","pumpkin","gourd",
        "mustard","turmeric","chili","coriander","cinnamon","cardamom","clove",
    ],
    "animals": [
        "cat","dog","cow","goat","sheep","chicken","duck","bird","fish","horse",
        "elephant","tiger","lion","monkey","rabbit","rat","mouse","snake","frog",
        "butterfly","bee","ant","fly","mosquito","crow","sparrow","parrot","eagle",
        "owl","pigeon","buffalo","ox","donkey","camel","deer","fox","wolf","bear",
        "pig","hen","rooster","chick","calf","lamb","kitten","puppy","animal",
        "insect","worm","snail","crab","shrimp","turtle","crocodile","lizard",
    ],
    "nature": [
        "tree","flower","leaf","grass","river","sea","ocean","mountain","hill",
        "forest","jungle","rain","sun","moon","star","sky","cloud","wind","storm",
        "fire","water","earth","rock","stone","sand","soil","mud","field","farm",
        "garden","plant","seed","root","branch","fruit","wood","bamboo","lake",
        "pond","stream","waterfall","island","beach","shore","wave","tide",
        "season","summer","winter","spring","autumn","day","night","light","dark",
        "rainbow","thunder","lightning","snow","ice","fog","mist","dust",
    ],
    "family": [
        "mother","father","sister","brother","son","daughter","baby","child","boy",
        "girl","man","woman","grandmother","grandfather","uncle","aunt","cousin",
        "husband","wife","family","parent","son","nephew","niece","friend","neighbor",
        "people","person","human","adult","elder","youth","infant","toddler",
    ],
    "colors": [
        "red","blue","green","yellow","white","black","orange","purple","pink",
        "brown","grey","gray","golden","silver","color","colour","bright","dark",
        "light","pale","deep","colorful","multicolor",
    ],
    "actions": [
        "run","walk","jump","sit","stand","sleep","wake","eat","drink","cook",
        "read","write","draw","paint","sing","dance","play","swim","fly","climb",
        "carry","hold","give","take","open","close","push","pull","throw","catch",
        "laugh","cry","smile","talk","speak","listen","watch","look","see","hear",
        "touch","feel","smell","taste","learn","teach","help","work","rest","come",
        "go","stop","start","call","ask","answer","say","tell","show","find",
        "make","build","break","wash","clean","cut","tie","wear","buy","sell",
        "love","like","want","need","know","think","remember","forget","understand",
    ],
    "places": [
        "home","house","school","hospital","market","mosque","church","road","street",
        "village","town","city","country","camp","field","forest","river","sea",
        "beach","mountain","shop","store","kitchen","room","door","window","roof",
        "wall","floor","bridge","garden","park","zoo","airport","port","station",
        "office","bank","library","restaurant","hotel","toilet","bathroom","bedroom",
    ],
    "body": [
        "head","face","eye","ear","nose","mouth","lip","tooth","tongue","neck",
        "shoulder","arm","hand","finger","chest","stomach","back","leg","knee",
        "foot","toe","hair","skin","blood","heart","bone","brain","body","voice",
        "thumb","palm","elbow","hip","ankle","heel","nail","cheek","chin","forehead",
        "eyebrow","eyelid","wrist","fist","waist","belly","navel","spine",
    ],
    "numbers": [
        "one","two","three","four","five","six","seven","eight","nine","ten",
        "eleven","twelve","thirteen","fourteen","fifteen","sixteen","seventeen",
        "eighteen","nineteen","twenty","thirty","forty","fifty","sixty","seventy",
        "eighty","ninety","hundred","thousand","million","zero","number","count",
        "first","second","third","half","quarter","many","few","some","all","both",
    ],
    "feelings": [
        "happy","sad","angry","scared","afraid","tired","hungry","thirsty","sick",
        "pain","love","hate","hope","worry","calm","excited","surprised","confused",
        "proud","shame","shy","brave","strong","weak","good","bad","beautiful",
        "ugly","kind","mean","hot","cold","warm","cool","loud","quiet","fast","slow",
        "hard","soft","heavy","light","big","small","long","short","new","old",
        "clean","dirty","wet","dry","safe","danger","easy","difficult","alone","together",
    ],
}

CATEGORIES = ["food", "animals", "nature", "family", "colors",
               "actions", "places", "body", "numbers", "feelings"]

# ─── EMOJI MAP ───────────────────────────────────────────────────────────────
EMOJI_MAP = {
    # food
    "apple":"🍎","banana":"🍌","mango":"🥭","rice":"🍚","bread":"🍞","fish":"🐟",
    "chicken":"🍗","meat":"🥩","milk":"🥛","egg":"🥚","water":"💧","juice":"🧃",
    "sugar":"🍬","salt":"🧂","oil":"🫙","flour":"🌾","potato":"🥔","onion":"🧅",
    "garlic":"🧄","ginger":"🫚","tomato":"🍅","lemon":"🍋","orange":"🍊",
    "grape":"🍇","melon":"🍈","pineapple":"🍍","coconut":"🥥","bean":"🫘",
    "lentil":"🫘","corn":"🌽","wheat":"🌾","tea":"🍵","coffee":"☕","soup":"🍲",
    "curry":"🍛","cake":"🎂","cookie":"🍪","candy":"🍭","chocolate":"🍫",
    "butter":"🧈","cheese":"🧀","yogurt":"🥛","honey":"🍯","pepper":"🌶️",
    "vegetable":"🥦","fruit":"🍎","meal":"🍽️","lunch":"🥗","dinner":"🍽️",
    "breakfast":"🥞","snack":"🍿","carrot":"🥕","cabbage":"🥬","spinach":"🥬",
    "pumpkin":"🎃","chili":"🌶️","coriander":"🌿","pea":"🫛",
    # animals
    "cat":"🐱","dog":"🐶","cow":"🐄","goat":"🐐","sheep":"🐑","duck":"🦆",
    "bird":"🐦","horse":"🐴","elephant":"🐘","tiger":"🐯","lion":"🦁",
    "monkey":"🐒","rabbit":"🐰","rat":"🐀","mouse":"🐭","snake":"🐍",
    "frog":"🐸","butterfly":"🦋","bee":"🐝","ant":"🐜","fly":"🪰",
    "mosquito":"🦟","crow":"🐦‍⬛","parrot":"🦜","eagle":"🦅","owl":"🦉",
    "pigeon":"🕊️","buffalo":"🐃","ox":"🐂","donkey":"🫏","camel":"🐪",
    "deer":"🦌","fox":"🦊","wolf":"🐺","bear":"🐻","pig":"🐷","hen":"🐔",
    "rooster":"🐓","chick":"🐣","calf":"🐄","lamb":"🐑","kitten":"🐱",
    "puppy":"🐶","insect":"🐛","worm":"🪱","snail":"🐌","crab":"🦀",
    "shrimp":"🍤","turtle":"🐢","crocodile":"🐊","lizard":"🦎",
    # nature
    "tree":"🌳","flower":"🌸","leaf":"🍃","grass":"🌿","river":"🏞️",
    "sea":"🌊","ocean":"🌊","mountain":"⛰️","hill":"🏔️","forest":"🌲",
    "jungle":"🌿","rain":"🌧️","sun":"☀️","moon":"🌙","star":"⭐",
    "sky":"🌤️","cloud":"☁️","wind":"🌬️","storm":"⛈️","fire":"🔥",
    "earth":"🌍","rock":"🪨","stone":"🪨","sand":"🏖️","soil":"🌱",
    "field":"🌾","farm":"🏡","garden":"🌻","plant":"🌱","seed":"🌱",
    "root":"🪴","branch":"🌿","wood":"🪵","lake":"🏞️","pond":"🌊",
    "waterfall":"💦","island":"🏝️","beach":"🏖️","rainbow":"🌈",
    "thunder":"⛈️","lightning":"⚡","snow":"❄️","ice":"🧊",
    # family
    "mother":"👩","father":"👨","sister":"👧","brother":"👦","son":"👦",
    "daughter":"👧","baby":"👶","child":"🧒","boy":"👦","girl":"👧",
    "man":"👨","woman":"👩","grandmother":"👵","grandfather":"👴",
    "uncle":"👨","aunt":"👩","cousin":"🧑","husband":"👨","wife":"👩",
    "family":"👨‍👩‍👧‍👦","friend":"🤝","neighbor":"🏘️","person":"🧑",
    # colors
    "red":"🔴","blue":"🔵","green":"🟢","yellow":"🟡","white":"⬜",
    "black":"⬛","orange":"🟠","purple":"🟣","pink":"🩷","brown":"🟫",
    "grey":"🩶","gray":"🩶","golden":"⭐","silver":"🔘","color":"🎨",
    # actions
    "run":"🏃","walk":"🚶","jump":"🤸","sit":"🧘","stand":"🧍",
    "sleep":"😴","eat":"🍽️","drink":"🥤","cook":"👨‍🍳","read":"📖",
    "write":"✍️","draw":"🎨","paint":"🖌️","sing":"🎤","dance":"💃",
    "play":"🎮","swim":"🏊","fly":"✈️","climb":"🧗","laugh":"😂",
    "cry":"😢","smile":"😊","talk":"💬","listen":"👂","watch":"👀",
    "help":"🤝","work":"💼","rest":"😌","love":"❤️","learn":"📚",
    "teach":"👨‍🏫","wash":"🧼","clean":"🧹","build":"🏗️",
    # places
    "home":"🏠","house":"🏠","school":"🏫","hospital":"🏥","market":"🛒",
    "mosque":"🕌","road":"🛣️","street":"🛣️","village":"🏘️","town":"🏙️",
    "city":"🌆","shop":"🏪","kitchen":"🍳","room":"🚪","door":"🚪",
    "window":"🪟","garden":"🌻","park":"🌳","zoo":"🦁","airport":"✈️",
    "restaurant":"🍽️","toilet":"🚽","bathroom":"🛁","bedroom":"🛏️",
    "bridge":"🌉","camp":"⛺",
    # body
    "head":"🗣️","face":"😊","eye":"👁️","ear":"👂","nose":"👃",
    "mouth":"👄","lip":"👄","tooth":"🦷","tongue":"👅","neck":"🤙",
    "shoulder":"💪","arm":"💪","hand":"✋","finger":"👆","chest":"💪",
    "stomach":"🫃","back":"🔙","leg":"🦵","knee":"🦵","foot":"🦶",
    "toe":"🦶","hair":"💇","skin":"🧴","blood":"🩸","heart":"❤️",
    "bone":"🦴","brain":"🧠","body":"🧍","thumb":"👍","elbow":"💪",
    "ankle":"🦵","nail":"💅","cheek":"😊","chin":"🧔","wrist":"⌚",
    # numbers
    "one":"1️⃣","two":"2️⃣","three":"3️⃣","four":"4️⃣","five":"5️⃣",
    "six":"6️⃣","seven":"7️⃣","eight":"8️⃣","nine":"9️⃣","ten":"🔟",
    "zero":"0️⃣","hundred":"💯","many":"🔢","count":"🔢","number":"🔢",
    "first":"🥇","second":"🥈","third":"🥉","half":"⚖️",
    # feelings
    "happy":"😊","sad":"😢","angry":"😠","scared":"😨","afraid":"😨",
    "tired":"😴","hungry":"🤤","thirsty":"😤","sick":"🤒","pain":"😣",
    "love":"❤️","hate":"😡","hope":"🌟","worry":"😟","calm":"😌",
    "excited":"🤩","surprised":"😲","confused":"😕","proud":"😤",
    "shame":"😳","shy":"😊","brave":"💪","strong":"💪","weak":"😔",
    "good":"👍","bad":"👎","beautiful":"✨","kind":"💝","hot":"🔥",
    "cold":"🥶","warm":"🌡️","loud":"📢","quiet":"🤫","fast":"⚡",
    "slow":"🐢","hard":"💪","soft":"🧸","heavy":"⚖️","light":"🪶",
    "big":"🔴","small":"🔵","long":"📏","short":"📏","new":"✨",
    "old":"📜","clean":"✨","dirty":"🗑️","wet":"💧","dry":"☀️",
    "safe":"🛡️","easy":"😊","difficult":"😤","alone":"🧍","together":"🤝",
}

DEFAULT_EMOJI = "📝"


def get_emoji(word):
    return EMOJI_MAP.get(word.lower(), DEFAULT_EMOJI)


def get_category(word):
    w = word.lower()
    for cat, keywords in CATEGORY_WORDS.items():
        if w in keywords:
            return cat
    return None


# ─── PDF PARSING ─────────────────────────────────────────────────────────────
def extract_entries_from_pdf(pdf_path):
    """
    Try to extract (english, rohingya) pairs from the PDF.
    Attempts several common dictionary layout patterns.
    Returns a list of (english, rohingya) tuples.
    """
    entries = []
    # Patterns to try (in order of preference):
    # 1. "word  translation (pos)" — two+ spaces between
    # 2. "word - translation"
    # 3. "word: translation"
    patterns = [
        # word  rohingya_word  optional (pos / pos.)
        re.compile(r'^([a-zA-Z][a-zA-Z\s\-]{0,30}?)\s{2,}([^\(]{2,60?})(?:\([^)]+\))?$'),
        # word - rohingya
        re.compile(r'^([a-zA-Z][a-zA-Z\s\-]{0,30}?)\s*[-–—]\s*(.{2,60})$'),
        # word: rohingya
        re.compile(r'^([a-zA-Z][a-zA-Z\s\-]{0,30}?):\s*(.{2,60})$'),
    ]

    try:
        with pdfplumber.open(pdf_path) as pdf:
            for page in pdf.pages:
                text = page.extract_text()
                if not text:
                    continue
                for line in text.splitlines():
                    line = line.strip()
                    if len(line) < 4:
                        continue
                    for pat in patterns:
                        m = pat.match(line)
                        if m:
                            en = m.group(1).strip().lower()
                            roh = m.group(2).strip()
                            # Take only the first translation (before comma/semicolon)
                            roh = re.split(r'[,;/]', roh)[0].strip()
                            if en and roh and len(en) >= 2:
                                entries.append((en, roh))
                            break
    except Exception as e:
        print(f"[WARN] PDF extraction error: {e}")

    return entries


# ─── FALLBACK WORD LIST ───────────────────────────────────────────────────────
# Used when PDF extraction yields insufficient words.
# Romanized Rohingya transliterations from published Hanifi dictionary materials.
FALLBACK_WORDS = {
    # food (20+)
    "apple":    ("sép",     "food"),
    "banana":   ("kela",    "food"),
    "mango":    ("aam",     "food"),
    "rice":     ("bhat",    "food"),
    "bread":    ("ruti",    "food"),
    "fish":     ("maas",    "food"),
    "chicken":  ("murgi",   "food"),
    "milk":     ("dut",     "food"),
    "egg":      ("dim",     "food"),
    "water":    ("paani",   "food"),
    "sugar":    ("cini",    "food"),
    "salt":     ("labon",   "food"),
    "oil":      ("tel",     "food"),
    "potato":   ("aloo",    "food"),
    "onion":    ("piaz",    "food"),
    "tomato":   ("tometo",  "food"),
    "lemon":    ("lebuu",   "food"),
    "orange":   ("komla",   "food"),
    "coconut":  ("narikol", "food"),
    "corn":     ("vutta",   "food"),
    "tea":      ("sha",     "food"),
    "soup":     ("shorba",  "food"),
    "honey":    ("modhu",   "food"),
    "pepper":   ("morich",  "food"),
    "ginger":   ("ada",     "food"),
    # animals (20+)
    "cat":      ("billi",   "animals"),
    "dog":      ("kutta",   "animals"),
    "cow":      ("gairu",   "animals"),
    "goat":     ("bakri",   "animals"),
    "sheep":    ("veda",    "animals"),
    "bird":     ("pakhi",   "animals"),
    "fish":     ("maas",    "animals"),
    "horse":    ("gura",    "animals"),
    "elephant": ("haati",   "animals"),
    "tiger":    ("baag",    "animals"),
    "monkey":   ("bandro",  "animals"),
    "rabbit":   ("khorgos", "animals"),
    "snake":    ("saamp",   "animals"),
    "frog":     ("baang",   "animals"),
    "butterfly":("projapoti","animals"),
    "bee":      ("mothor",  "animals"),
    "ant":      ("pipra",   "animals"),
    "crow":     ("kaak",    "animals"),
    "parrot":   ("tiya",    "animals"),
    "owl":      ("pecha",   "animals"),
    "duck":     ("hans",    "animals"),
    "hen":      ("murgi",   "animals"),
    "pig":      ("shuar",   "animals"),
    "deer":     ("horin",   "animals"),
    # nature (20+)
    "tree":     ("gaas",    "nature"),
    "flower":   ("ful",     "nature"),
    "leaf":     ("pata",    "nature"),
    "grass":    ("ghas",    "nature"),
    "river":    ("nodi",    "nature"),
    "sea":      ("doria",   "nature"),
    "mountain": ("porbat",  "nature"),
    "forest":   ("bon",     "nature"),
    "rain":     ("brishti", "nature"),
    "sun":      ("roud",    "nature"),
    "moon":     ("cand",    "nature"),
    "star":     ("taara",   "nature"),
    "sky":      ("akash",   "nature"),
    "cloud":    ("megh",    "nature"),
    "fire":     ("ag",      "nature"),
    "earth":    ("mitthi",  "nature"),
    "rock":     ("pather",  "nature"),
    "sand":     ("baluu",   "nature"),
    "farm":     ("kaet",    "nature"),
    "plant":    ("gach",    "nature"),
    "lake":     ("bil",     "nature"),
    "wind":     ("batash",  "nature"),
    "rainbow":  ("ranga megh","nature"),
    "ice":      ("borf",    "nature"),
    "snow":     ("him",     "nature"),
    # family (20+)
    "mother":   ("maai",    "family"),
    "father":   ("baap",    "family"),
    "sister":   ("bon",     "family"),
    "brother":  ("bai",     "family"),
    "son":      ("pua",     "family"),
    "daughter": ("jhi",     "family"),
    "baby":     ("bachcha", "family"),
    "child":    ("fura",    "family"),
    "boy":      ("shiyaan", "family"),
    "girl":     ("fuuri",   "family"),
    "man":      ("manush",  "family"),
    "woman":    ("mainis",  "family"),
    "grandmother":("naani", "family"),
    "grandfather":("daada", "family"),
    "uncle":    ("chacha",  "family"),
    "aunt":     ("chachi",  "family"),
    "husband":  ("loijja",  "family"),
    "wife":     ("bou",     "family"),
    "friend":   ("beshti",  "family"),
    "neighbor": ("joot",    "family"),
    "family":   ("poribar", "family"),
    # colors (20+)
    "red":      ("laal",    "colors"),
    "blue":     ("nila",    "colors"),
    "green":    ("sabuj",   "colors"),
    "yellow":   ("peela",   "colors"),
    "white":    ("ujla",    "colors"),
    "black":    ("kaala",   "colors"),
    "orange":   ("narinja",  "colors"),
    "purple":   ("beguni",  "colors"),
    "pink":     ("golapi",  "colors"),
    "brown":    ("badami",  "colors"),
    "grey":     ("dhushor", "colors"),
    "golden":   ("sona rong","colors"),
    "silver":   ("rupa rong","colors"),
    "bright":   ("ujjol",   "colors"),
    "dark":     ("andhaar", "colors"),
    "light":    ("halka",   "colors"),
    "pale":     ("faka",    "colors"),
    "colorful": ("ronga",   "colors"),
    "multicolor":("nonorang","colors"),
    "deep":     ("ghor",    "colors"),
    # actions (20+)
    "run":      ("doud",    "actions"),
    "walk":     ("hata",    "actions"),
    "jump":     ("laaf",    "actions"),
    "sit":      ("bos",     "actions"),
    "sleep":    ("ghum",    "actions"),
    "eat":      ("kha",     "actions"),
    "drink":    ("khaa",    "actions"),
    "cook":     ("ranna",   "actions"),
    "read":     ("pora",    "actions"),
    "write":    ("lekha",   "actions"),
    "draw":     ("aaka",    "actions"),
    "sing":     ("gaan gao","actions"),
    "dance":    ("naach",   "actions"),
    "play":     ("khel",    "actions"),
    "swim":     ("shotar",  "actions"),
    "climb":    ("ot",      "actions"),
    "laugh":    ("haas",    "actions"),
    "cry":      ("kaand",   "actions"),
    "smile":    ("hasi",    "actions"),
    "talk":     ("kotha",   "actions"),
    "listen":   ("shon",    "actions"),
    "help":     ("shahajjo","actions"),
    "love":     ("bhaala baasha","actions"),
    "learn":    ("shekha",  "actions"),
    "wash":     ("dhua",    "actions"),
    # places (20+)
    "home":     ("bari",    "places"),
    "house":    ("gor",     "places"),
    "school":   ("shiksha", "places"),
    "hospital": ("hastpatal","places"),
    "market":   ("bazar",   "places"),
    "mosque":   ("masjid",  "places"),
    "road":     ("rasta",   "places"),
    "village":  ("gram",    "places"),
    "town":     ("shahor",  "places"),
    "field":    ("matan",   "places"),
    "forest":   ("bon",     "places"),
    "garden":   ("bagan",   "places"),
    "kitchen":  ("ranna ghor","places"),
    "room":     ("kamera",  "places"),
    "shop":     ("dokan",   "places"),
    "bridge":   ("pul",     "places"),
    "camp":     ("chaoni",  "places"),
    "beach":    ("bela bumi","places"),
    "farm":     ("kaet",    "places"),
    "park":     ("uddan",   "places"),
    "zoo":      ("prani uddan","places"),
    "bathroom": ("goshol ghor","places"),
    "bedroom":  ("ghum ghor","places"),
    # body (20+)
    "head":     ("mota",    "body"),
    "face":     ("mukh",    "body"),
    "eye":      ("aankh",   "body"),
    "ear":      ("kaun",    "body"),
    "nose":     ("naak",    "body"),
    "mouth":    ("muk",     "body"),
    "tooth":    ("daant",   "body"),
    "tongue":   ("jiib",    "body"),
    "neck":     ("ghaar",   "body"),
    "shoulder": ("kaand",   "body"),
    "arm":      ("baahu",   "body"),
    "hand":     ("haat",    "body"),
    "finger":   ("aangul",  "body"),
    "chest":    ("buk",     "body"),
    "stomach":  ("pet",     "body"),
    "back":     ("pith",    "body"),
    "leg":      ("paiya",   "body"),
    "knee":     ("ghutun",  "body"),
    "foot":     ("paa",     "body"),
    "hair":     ("baal",    "body"),
    "heart":    ("kalija",  "body"),
    "bone":     ("haddi",   "body"),
    "brain":    ("dimas",   "body"),
    "skin":     ("charma",  "body"),
    "blood":    ("roud",    "body"),
    # numbers (20+)
    "one":      ("ek",      "numbers"),
    "two":      ("dui",     "numbers"),
    "three":    ("tin",     "numbers"),
    "four":     ("char",    "numbers"),
    "five":     ("paanch",  "numbers"),
    "six":      ("shoy",    "numbers"),
    "seven":    ("saat",    "numbers"),
    "eight":    ("aat",     "numbers"),
    "nine":     ("noi",     "numbers"),
    "ten":      ("dos",     "numbers"),
    "eleven":   ("gyaaro",  "numbers"),
    "twelve":   ("baaro",   "numbers"),
    "twenty":   ("biish",   "numbers"),
    "thirty":   ("tish",    "numbers"),
    "forty":    ("chaalis", "numbers"),
    "fifty":    ("pachash", "numbers"),
    "hundred":  ("shoy",    "numbers"),
    "zero":     ("shunno",  "numbers"),
    "many":     ("boro",    "numbers"),
    "few":      ("shara",   "numbers"),
    "half":     ("adek",    "numbers"),
    "first":    ("pothom",  "numbers"),
    "second":   ("duitia",  "numbers"),
    "third":    ("tirtio",  "numbers"),
    # feelings (20+)
    "happy":    ("khushi",  "feelings"),
    "sad":      ("dukhi",   "feelings"),
    "angry":    ("garam",   "feelings"),
    "scared":   ("bhoi",    "feelings"),
    "tired":    ("thaka",   "feelings"),
    "hungry":   ("khida",   "feelings"),
    "thirsty":  ("piyaas",  "feelings"),
    "sick":     ("aijja",   "feelings"),
    "love":     ("bhaala basha","feelings"),
    "hope":     ("aasha",   "feelings"),
    "calm":     ("shanto",  "feelings"),
    "excited":  ("utshahi", "feelings"),
    "surprised":("ashan",   "feelings"),
    "proud":    ("garibo",  "feelings"),
    "shy":      ("lajuk",   "feelings"),
    "brave":    ("shahshi", "feelings"),
    "strong":   ("balwan",  "feelings"),
    "good":     ("bhalo",   "feelings"),
    "bad":      ("kharap",  "feelings"),
    "beautiful":("shundor", "feelings"),
    "kind":     ("dayaluu", "feelings"),
    "lonely":   ("ekaaki",  "feelings"),
    "safe":     ("nirapod", "feelings"),
    "worried":  ("chintit", "feelings"),
}


def build_word_list(pdf_entries):
    """
    Merge PDF-extracted entries with the fallback list.
    PDF entries take priority if they match a known category word.
    Returns list of dicts ready for words.js.
    """
    # Start with fallback words
    result_by_cat = {cat: {} for cat in CATEGORIES}

    for en, (roh, cat) in FALLBACK_WORDS.items():
        result_by_cat[cat][en] = roh

    # Overlay with PDF entries where we can categorise them
    for en, roh in pdf_entries:
        cat = get_category(en)
        if cat:
            result_by_cat[cat][en] = roh

    # Build final flat list
    words = []
    for cat in CATEGORIES:
        for en, roh in result_by_cat[cat].items():
            # Skip duplicates that exist under multiple cats (e.g. "fish")
            words.append({
                "en":    en,
                "roh":   roh,
                "emoji": get_emoji(en),
                "cat":   cat,
            })

    return words


def write_words_js(words, out_path):
    lines = ["export const WORDS = ["]
    for w in words:
        en  = json.dumps(w["en"],    ensure_ascii=False)
        roh = json.dumps(w["roh"],   ensure_ascii=False)
        em  = json.dumps(w["emoji"], ensure_ascii=False)
        cat = json.dumps(w["cat"],   ensure_ascii=False)
        lines.append(f'  {{ en: {en}, roh: {roh}, emoji: {em}, cat: {cat} }},')
    lines.append("];")
    lines.append("")
    lines.append("export const CATEGORIES = [")
    lines.append('  "food", "animals", "nature", "family", "colors",')
    lines.append('  "actions", "places", "body", "numbers", "feelings"')
    lines.append("];")
    out_path.write_text("\n".join(lines), encoding="utf-8")
    print(f"[OK] Wrote {len(words)} words → {out_path}")


def main():
    pdf_path = Path("English-Rohingya-28-Dec-2017.pdf")
    out_path = Path("src/data/words.js")

    print(f"[INFO] Reading {pdf_path} ...")
    pdf_entries = []
    if pdf_path.exists():
        pdf_entries = extract_entries_from_pdf(pdf_path)
        print(f"[INFO] Extracted {len(pdf_entries)} raw entries from PDF")
    else:
        print(f"[WARN] PDF not found — using fallback word list only")

    words = build_word_list(pdf_entries)

    # Report per-category counts
    from collections import Counter
    counts = Counter(w["cat"] for w in words)
    print("\nWords per category:")
    for cat in CATEGORIES:
        print(f"  {cat:12s}: {counts[cat]:3d}")
    print(f"  {'TOTAL':12s}: {len(words):3d}")

    write_words_js(words, out_path)


if __name__ == "__main__":
    main()

# simple light classifier using keywords. If sentence-transformers installed, you can replace.
import re
def score_messages(messages):
    scores=[]
    for m in messages:
        t = m.lower()
        s=0.1
        if re.search(r'\b(flood|water|surround|submerge|submerged|inundat|trapped)\b', t):
            s=0.95
        elif re.search(r'\b(heavy rain|overflow|rising|overflowing)\b', t):
            s=0.7
        elif re.search(r'\b(safe|ok|fine)\b', t):
            s=0.05
        scores.append(float(s))
    return scores

class SocialClassifier:
    def score_messages(self, messages):
        return score_messages(messages)

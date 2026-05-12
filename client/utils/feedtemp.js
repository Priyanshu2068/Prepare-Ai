const feedtemp = [
  (data) => `You scored ${data.percentage}%, which gives us a useful snapshot without pretending one quiz defines your destiny. Your strongest area was ${data.strongTopics.length > 0 ? data.strongTopics[0] : 'still warming up'}, while ${data.weakTopics.length > 0 ? data.weakTopics.join(', ') : 'no major weak spot'} needs the next practice spotlight. Review the missed concepts, solve a few focused questions, and your score should stop acting mysterious.`,

  (data) => `You got ${data.score}/${data.totalQuestions} correct, so the signal is pretty clear. ${data.strongTopics.length > 0 ? `You handled ${data.strongTopics.join(', ')} well.` : 'No clear strong topic appeared yet, which is normal early on.'} ${data.weakTopics.length > 0 ? `Spend extra time on ${data.weakTopics.join(', ')} before the next round.` : 'No obvious weak topic showed up, which is a nice little victory.'} One practical move: write down why each wrong answer was tempting, because wrong options love wearing tiny disguises.`,

  (data) => `${data.percentage}% is ${data.percentage >= 70 ? 'a strong result' : 'a useful checkpoint'}, not a final judgment. ${data.strongTopics.length > 0 ? `Your answers show confidence in ${data.strongTopics.join(', ')}.` : 'Build one reliable topic first, then expand from there.'} ${data.weakTopics.length > 0 ? `The next best use of time is revising ${data.weakTopics.join(', ')}.` : 'Keep rotating topics so the comfort zone does not get too comfortable.'} Study tip: explain one missed question out loud like you are teaching it to a very patient friend.`,
];

export default feedtemp;
